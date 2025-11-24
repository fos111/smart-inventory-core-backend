const mongoose = require('mongoose');

const Equipment = require('../models/Equipment');
const Room = require('../models/Room');

const movementController = {
  /**
   * Déplacer un équipement vers une nouvelle salle
   */
 moveEquipment: async (req, res) => {
    try {
      const { equipmentId } = req.params;
      const { newRoomId, newRoomCode, reason = "manual" } = req.body;

      console.log(`🚚 Déplacement de l'équipement ${equipmentId} vers ${newRoomCode || newRoomId}`);

      // Vérifier que l'équipement existe
      let equipment;
      
      // Si c'est un ObjectId valide, chercher par ID
      if (mongoose.Types.ObjectId.isValid(equipmentId)) {
        equipment = await Equipment.findById(equipmentId);
      } else {
        // Sinon, chercher par serialNumber ou assetTag
        equipment = await Equipment.findOne({
          $or: [
            { serialNumber: equipmentId.toUpperCase() },
            { assetTag: equipmentId.toUpperCase() }
          ]
        });
      }

      if (!equipment) {
        return res.status(404).json({
          success: false,
          error: 'Équipement non trouvé'
        });
      }

      let newRoom;
      
      // Recherche par code de salle (priorité)
      if (newRoomCode) {
        newRoom = await Room.findOne({ code: newRoomCode.toUpperCase() });
        if (!newRoom) {
          return res.status(404).json({
            success: false,
            error: `Salle avec le code "${newRoomCode}" non trouvée`
          });
        }
      } 
      // Recherche par ID de salle
      else if (newRoomId) {
        newRoom = await Room.findById(newRoomId);
        if (!newRoom) {
          return res.status(404).json({
            success: false,
            error: 'Salle non trouvée'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'Soit newRoomId soit newRoomCode est requis'
        });
      }

      // Valider que la raison est dans l'énumération
      const validReasons = ['manual', 'rfid_auto', 'maintenance', 'transfer', 'other'];
      const finalReason = validReasons.includes(reason) ? reason : 'manual';

      // Sauvegarder l'ancienne salle pour la réponse
      const oldRoom = equipment.location.room ? 
        await Room.findById(equipment.location.room) : null;

      // Déplacer l'équipement
      await equipment.moveToRoom(newRoom._id, null, finalReason);

      // Récupérer l'équipement mis à jour avec les populations
      const updatedEquipment = await Equipment.findById(equipment._id)
        .populate('location.room', 'code name building')
        .populate('movementHistory.fromRoom', 'code name')
        .populate('movementHistory.toRoom', 'code name');

      console.log(`✅ Équipement ${equipment._id} déplacé de ${oldRoom?.code || 'Aucune'} à ${newRoom.code}`);

      res.json({
        success: true,
        message: `Équipement déplacé de ${oldRoom?.code || 'Aucune'} à ${newRoom.code}`,
        equipment: {
          id: updatedEquipment._id,
          name: updatedEquipment.name,
          serialNumber: updatedEquipment.serialNumber,
          currentLocation: {
            room: updatedEquipment.location.room,
            roomCode: updatedEquipment.location.roomCode,
            building: updatedEquipment.location.building
          },
          previousLocation: {
            room: oldRoom,
            roomCode: oldRoom?.code
          }
        },
        movement: updatedEquipment.movementHistory[updatedEquipment.movementHistory.length - 1]
      });

    } catch (error) {
      console.error('❌ Erreur lors du déplacement de l\'équipement:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors du déplacement de l\'équipement'
      });
    }
  },

  /**
   * Obtenir l'historique des mouvements d'un équipement
   */
  getMovementHistory: async (req, res) => {
    try {
      const { equipmentId } = req.params;

      console.log(`📋 Récupération de l'historique des mouvements pour l'équipement ${equipmentId}`);

      // Recherche flexible par ID ou identifiant
      let equipment;
      if (mongoose.Types.ObjectId.isValid(equipmentId)) {
        equipment = await Equipment.findById(equipmentId)
          .populate('movementHistory.fromRoom', 'code name building')
          .populate('movementHistory.toRoom', 'code name building')
          .select('movementHistory name serialNumber');
      } else {
        equipment = await Equipment.findOne({
          $or: [
            { serialNumber: equipmentId.toUpperCase() },
            { assetTag: equipmentId.toUpperCase() }
          ]
        })
        .populate('movementHistory.fromRoom', 'code name building')
        .populate('movementHistory.toRoom', 'code name building')
        .select('movementHistory name serialNumber');
      }

      if (!equipment) {
        return res.status(404).json({
          success: false,
          error: 'Équipement non trouvé'
        });
      }

      console.log(`✅ ${equipment.movementHistory.length} mouvements trouvés`);

      res.json({
        success: true,
        message: `${equipment.movementHistory.length} mouvements trouvés`,
        equipment: {
          id: equipment._id,
          name: equipment.name,
          serialNumber: equipment.serialNumber
        },
        movementHistory: equipment.movementHistory,
        count: equipment.movementHistory.length
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération de l\'historique'
      });
    }
  },
  /**
   * Obtenir l'historique des mouvements d'un équipement
   */
  getMovementHistory: async (req, res) => {
    try {
      const { equipmentId } = req.params;

      console.log(`📋 Récupération de l'historique des mouvements pour l'équipement ${equipmentId}`);

      const equipment = await Equipment.findById(equipmentId)
        .populate('movementHistory.fromRoom', 'code name building')
        .populate('movementHistory.toRoom', 'code name building')
        .select('movementHistory name serialNumber');

      if (!equipment) {
        return res.status(404).json({
          success: false,
          error: 'Équipement non trouvé'
        });
      }

      console.log(`✅ ${equipment.movementHistory.length} mouvements trouvés`);

      res.json({
        success: true,
        message: `${equipment.movementHistory.length} mouvements trouvés`,
        equipment: {
          id: equipment._id,
          name: equipment.name,
          serialNumber: equipment.serialNumber
        },
        movementHistory: equipment.movementHistory,
        count: equipment.movementHistory.length
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération de l\'historique'
      });
    }
  },

  /**
   * Endpoint pour les détections RFID (automatique)
   */
  handleRFIDDetection: async (req, res) => {
    try {
      const { readerId, equipmentTag, eventType, timestamp } = req.body;

      console.log(`📡 Détection RFID: ${equipmentTag} - ${eventType} - Lecteur: ${readerId}`);

      // Valider les données requises
      if (!readerId || !equipmentTag || !eventType) {
        return res.status(400).json({
          success: false,
          error: 'Données RFID incomplètes. Requis: readerId, equipmentTag, eventType'
        });
      }

      // Trouver la salle correspondant au lecteur RFID
      const room = await Room.findOne({ 
        $or: [
          { code: readerId },
          { 'rfidReaders.readerId': readerId }
        ]
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          error: `Aucune salle trouvée pour le lecteur RFID: ${readerId}`
        });
      }

      // Trouver l'équipement par son tag RFID, serialNumber ou assetTag
      const equipment = await Equipment.findOne({
        $or: [
          { rfidTag: equipmentTag.toUpperCase() },
          { serialNumber: equipmentTag.toUpperCase() },
          { assetTag: equipmentTag.toUpperCase() }
        ]
      });

      if (!equipment) {
        return res.status(404).json({
          success: false,
          error: `Aucun équipement trouvé avec le tag: ${equipmentTag}`
        });
      }

      // Déplacer l'équipement si c'est une entrée
      if (eventType === 'entry') {
        const rfidData = {
          readerId: readerId,
          timestamp: timestamp || new Date()
        };

        await equipment.moveToRoom(room._id, null, "rfid_auto", rfidData);

        console.log(`✅ Détection RFID traitée: ${equipment.name} déplacé vers ${room.code}`);
      }

      res.json({
        success: true,
        message: `Détection RFID traitée: ${equipment.name} - ${eventType} - ${room.code}`,
        detection: {
          equipment: {
            id: equipment._id,
            name: equipment.name,
            serialNumber: equipment.serialNumber
          },
          room: {
            id: room._id,
            code: room.code,
            name: room.name
          },
          eventType: eventType,
          readerId: readerId,
          timestamp: timestamp || new Date()
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors du traitement de la détection RFID:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors du traitement de la détection RFID'
      });
    }
  }
};

module.exports = movementController;
