const mongoose = require('mongoose');

const Room = require('../models/Room');
const Equipment = require('../models/Equipment');

const roomController = {
  /**
   * Obtenir toutes les salles disponibles
   */
  getAllRooms: async (req, res) => {
    try {
      console.log('📋 Récupération de toutes les salles');
      
      const { withEquipment, withRFID } = req.query;
      
      let rooms = await Room.find({ isActive: true })
        .sort({ code: 1 })
        .select('-__v')
        .lean();

      // Compter les équipements si demandé
      if (withEquipment === 'true') {
        for (let room of rooms) {
          const equipmentCount = await Equipment.countDocuments({
            'location.room': room._id,
            isActive: true
          });
          room.equipmentCount = equipmentCount;
        }
      }

      // Filtrer les salles avec RFID si demandé
      if (withRFID === 'true') {
        rooms = rooms.filter(room => room.rfidReaders && room.rfidReaders.length > 0);
      }

      console.log(`✅ ${rooms.length} salles trouvées`);

      res.json({
        success: true,
        message: `${rooms.length} salles trouvées`,
        count: rooms.length,
        rooms: rooms
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des salles:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des salles'
      });
    }
  },

  /**
   * Obtenir les salles par type
   */
  getRoomsByType: async (req, res) => {
    try {
      const { type } = req.params;
      
      console.log(`📋 Récupération des salles de type: ${type}`);

      const rooms = await Room.find({ 
        type: type,
        isActive: true 
      })
      .sort({ code: 1 })
      .select('-__v')
      .lean();

      console.log(`✅ ${rooms.length} salles de type ${type} trouvées`);

      res.json({
        success: true,
        message: `${rooms.length} salles de type ${type} trouvées`,
        count: rooms.length,
        rooms: rooms
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des salles par type:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des salles'
      });
    }
  },

  /**
   * Obtenir les salles par bâtiment
   */
  getRoomsByBuilding: async (req, res) => {
    try {
      const { building } = req.params;
      
      console.log(`📋 Récupération des salles du bâtiment: ${building}`);

      const rooms = await Room.find({ 
        building: new RegExp(building, 'i'),
        isActive: true 
      })
      .sort({ code: 1 })
      .select('-__v')
      .lean();

      console.log(`✅ ${rooms.length} salles du bâtiment ${building} trouvées`);

      res.json({
        success: true,
        message: `${rooms.length} salles du bâtiment ${building} trouvées`,
        count: rooms.length,
        rooms: rooms
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des salles par bâtiment:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des salles'
      });
    }
  },

  /**
   * Obtenir une salle spécifique
   */
  getRoomById: async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`📋 Récupération de la salle: ${id}`);

      let room;
      if (mongoose.Types.ObjectId.isValid(id)) {
        room = await Room.findById(id);
      } else {
        room = await Room.findOne({ code: id.toUpperCase() });
      }

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Salle non trouvée'
        });
      }

      // Compter les équipements dans cette salle
      const equipmentCount = await Equipment.countDocuments({
        'location.room': room._id,
        isActive: true
      });

      const roomData = room.toObject();
      roomData.equipmentCount = equipmentCount;

      console.log(`✅ Salle trouvée: ${room.code}`);

      res.json({
        success: true,
        message: `Salle ${room.code} trouvée`,
        room: roomData
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la salle:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération de la salle'
      });
    }
  },

  /**
   * Ajouter un lecteur RFID à une salle
   */
  addRFIDReader: async (req, res) => {
    try {
      const { id } = req.params;
      const { readerId, readerType, location, notes } = req.body;

      console.log(`📡 Ajout du lecteur RFID ${readerId} à la salle ${id}`);

      if (!readerId) {
        return res.status(400).json({
          success: false,
          error: 'Le readerId est requis'
        });
      }

      let room;
      if (mongoose.Types.ObjectId.isValid(id)) {
        room = await Room.findById(id);
      } else {
        room = await Room.findOne({ code: id.toUpperCase() });
      }

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Salle non trouvée'
        });
      }

      // Vérifier si le lecteur existe déjà
      const existingReader = room.rfidReaders.find(r => r.readerId === readerId.toUpperCase());
      if (existingReader) {
        return res.status(400).json({
          success: false,
          error: `Un lecteur avec l'ID ${readerId} existe déjà dans cette salle`
        });
      }

      await room.addRFIDReader({
        readerId,
        readerType,
        location,
        notes,
        installationDate: new Date()
      });

      console.log(`✅ Lecteur RFID ${readerId} ajouté à la salle ${room.code}`);

      res.json({
        success: true,
        message: `Lecteur RFID ${readerId} ajouté avec succès`,
        room: {
          id: room._id,
          code: room.code,
          name: room.name,
          rfidReaders: room.rfidReaders
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du lecteur RFID:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de l\'ajout du lecteur RFID'
      });
    }
  },

  /**
   * Obtenir les statistiques RFID d'une salle
   */
  getRFIDStats: async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`📊 Récupération des statistiques RFID pour la salle: ${id}`);

      let room;
      if (mongoose.Types.ObjectId.isValid(id)) {
        room = await Room.findById(id);
      } else {
        room = await Room.findOne({ code: id.toUpperCase() });
      }

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Salle non trouvée'
        });
      }

      // Mettre à jour le compteur d'équipements
      await room.updateRFIDStats();

      // Obtenir les équipements présents dans la salle
      const equipmentInRoom = await Equipment.find({
        'location.room': room._id,
        isActive: true
      }).select('name serialNumber rfidTag lastRFIDDetection status');

      console.log(`✅ Statistiques RFID récupérées pour ${room.code}`);

      res.json({
        success: true,
        message: `Statistiques RFID pour ${room.code}`,
        room: {
          id: room._id,
          code: room.code,
          name: room.name
        },
        rfidStats: room.rfidStats,
        rfidReaders: room.rfidReaders.filter(reader => reader.isActive),
        equipment: {
          count: equipmentInRoom.length,
          items: equipmentInRoom
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques RFID:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des statistiques RFID'
      });
    }
  },

  /**
   * Obtenir les salles avec lecteurs RFID
   */
  getRoomsWithRFID: async (req, res) => {
    try {
      console.log('📡 Récupération des salles avec lecteurs RFID');

      const rooms = await Room.findRoomsWithRFID()
        .sort({ code: 1 })
        .select('code name building rfidReaders rfidStats')
        .lean();

      console.log(`✅ ${rooms.length} salles avec RFID trouvées`);

      res.json({
        success: true,
        message: `${rooms.length} salles avec lecteurs RFID trouvées`,
        count: rooms.length,
        rooms: rooms
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des salles avec RFID:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des salles avec RFID'
      });
    }
  },

  /**
   * Créer une nouvelle salle
   */
  createRoom: async (req, res) => {
    try {
      const { code, name, building, department, type, capacity, description } = req.body;

      console.log(`🏗️ Création d'une nouvelle salle: ${code}`);

      // Vérifier si la salle existe déjà
      const existingRoom = await Room.findOne({ code: code.toUpperCase() });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          error: `Une salle avec le code ${code} existe déjà`
        });
      }

      const room = new Room({
        code: code.toUpperCase(),
        name,
        building,
        department,
        type: type || 'labo',
        capacity,
        description
      });

      await room.save();

      console.log(`✅ Salle créée: ${room.code}`);

      res.status(201).json({
        success: true,
        message: `Salle ${room.code} créée avec succès`,
        room: room
      });

    } catch (error) {
      console.error('❌ Erreur lors de la création de la salle:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la création de la salle'
      });
    }
  }
};

module.exports = roomController;