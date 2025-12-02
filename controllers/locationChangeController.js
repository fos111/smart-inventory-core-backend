const LocationChangeRequest = require('../models/LocationChangeRequest');
const Equipment = require('../models/Equipment');
const Room = require('../models/Room');

const locationChangeController = {
  /**
   * Créer une demande de changement de localisation
   */
  createLocationChangeRequest: async (req, res) => {
    try {
      const { equipmentId, requestedRoom, reason, requestType = 'transfer' } = req.body;

      console.log(`📋 Création demande de changement pour équipement: ${equipmentId}`);

      // 1. Vérifier si l'équipement existe
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        return res.status(404).json({
          success: false,
          error: 'Équipement non trouvé'
        });
      }

      // 2. Vérifier si une demande est déjà en cours
      if (equipment.pendingLocationChange && equipment.pendingLocationChange.requestId) {
        return res.status(400).json({
          success: false,
          error: 'Une demande de changement de localisation est déjà en attente pour cet équipement'
        });
      }

      // 3. Vérifier si la salle demandée existe
      const room = await Room.findOne({ code: requestedRoom });
      if (!room) {
        return res.status(404).json({
          success: false,
          error: `La salle ${requestedRoom} n'existe pas`
        });
      }

      // 4. Créer la demande
      const locationChangeRequest = new LocationChangeRequest({
        equipment: equipmentId,
        equipmentInfo: {
          name: equipment.name,
          serialNumber: equipment.serialNumber,
          model: equipment.model
        },
        currentLocation: equipment.location || {},
        requestedLocation: {
          building: room.building,
          room: room.code,
          department: room.department
        },
        requestType,
        reason,
        requestedBy: {
          userName: req.body.requestedBy || 'System',
          department: req.body.department || 'Unspecified'
        },
        priority: req.body.priority || 'medium'
      });

      await locationChangeRequest.save();

      // 5. Mettre à jour l'équipement avec la demande en attente
      equipment.pendingLocationChange = {
        requestId: locationChangeRequest._id,
        requestedLocation: {
          building: room.building,
          room: room.code,
          department: room.department
        },
        requestedAt: new Date()
      };

      await equipment.save();

      res.status(201).json({
        success: true,
        message: 'Demande de changement de localisation créée avec succès',
        requestId: locationChangeRequest._id,
        request: {
          id: locationChangeRequest._id,
          equipment: equipment.name,
          from: equipment.location?.room || 'Non spécifié',
          to: room.code,
          status: 'pending',
          requestedAt: locationChangeRequest.createdAt
        }
      });

    } catch (error) {
      console.error('❌ Erreur création demande de changement:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Obtenir toutes les demandes en attente
   */
  getPendingRequests: async (req, res) => {
    try {
      const requests = await LocationChangeRequest.find({ 
        status: 'pending',
        isActive: true 
      })
      .populate('equipment', 'name serialNumber model')
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

      res.json({
        success: true,
        message: `${requests.length} demandes en attente`,
        count: requests.length,
        requests
      });

    } catch (error) {
      console.error('❌ Erreur récupération demandes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Approuver une demande de changement
   */
  approveLocationChange: async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes, reviewedBy = 'Admin' } = req.body;

      console.log(`✅ Approbation demande: ${id}`);

      // 1. Trouver la demande
      const request = await LocationChangeRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Demande non trouvée'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: `Cette demande a déjà été ${request.status === 'approved' ? 'approuvée' : 'rejetée'}`
        });
      }

      // 2. Trouver l'équipement
      const equipment = await Equipment.findById(request.equipment);
      if (!equipment) {
        return res.status(404).json({
          success: false,
          error: 'Équipement non trouvé'
        });
      }

      // 3. Mettre à jour la localisation de l'équipement
      equipment.location = {
        ...equipment.location,
        building: request.requestedLocation.building,
        room: request.requestedLocation.room,
        department: request.requestedLocation.department
      };

      // 4. Nettoyer la demande en attente
      equipment.pendingLocationChange = undefined;

      await equipment.save();

      // 5. Mettre à jour la demande
      request.status = 'approved';
      request.reviewedBy = {
        userName: reviewedBy,
        role: 'Administrator'
      };
      request.reviewDate = new Date();
      request.reviewNotes = reviewNotes;
      request.effectiveDate = new Date();

      await request.save();

      res.json({
        success: true,
        message: 'Changement de localisation approuvé et appliqué',
        equipment: {
          id: equipment._id,
          name: equipment.name,
          newLocation: equipment.location
        },
        request: {
          id: request._id,
          status: request.status,
          reviewedAt: request.reviewDate
        }
      });

    } catch (error) {
      console.error('❌ Erreur approbation demande:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Rejeter une demande de changement
   */
  rejectLocationChange: async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewNotes, reviewedBy = 'Admin' } = req.body;

      console.log(`❌ Rejet demande: ${id}`);

      const request = await LocationChangeRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Demande non trouvée'
        });
      }

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: `Cette demande a déjà été ${request.status === 'approved' ? 'approuvée' : 'rejetée'}`
        });
      }

      // 1. Nettoyer la demande en attente sur l'équipement
      const equipment = await Equipment.findById(request.equipment);
      if (equipment) {
        equipment.pendingLocationChange = undefined;
        await equipment.save();
      }

      // 2. Mettre à jour la demande
      request.status = 'rejected';
      request.reviewedBy = {
        userName: reviewedBy,
        role: 'Administrator'
      };
      request.reviewDate = new Date();
      request.reviewNotes = reviewNotes;

      await request.save();

      res.json({
        success: true,
        message: 'Demande de changement rejetée',
        request: {
          id: request._id,
          status: request.status,
          reviewedAt: request.reviewDate
        }
      });

    } catch (error) {
      console.error('❌ Erreur rejet demande:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Obtenir l'historique des changements d'un équipement
   */
  getEquipmentLocationHistory: async (req, res) => {
    try {
      const { equipmentId } = req.params;

      const history = await LocationChangeRequest.find({
        equipment: equipmentId,
        status: 'approved'
      })
      .sort({ effectiveDate: -1 })
      .select('currentLocation requestedLocation effectiveDate reason reviewedBy')
      .lean();

      res.json({
        success: true,
        message: `${history.length} changements de localisation trouvés`,
        history
      });

    } catch (error) {
      console.error('❌ Erreur récupération historique:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = locationChangeController;