const Room = require('../models/Room');

const roomController = {
  /**
   * Obtenir toutes les salles disponibles
   */
  getAllRooms: async (req, res) => {
    try {
      console.log('📋 Récupération de toutes les salles');
      
      const rooms = await Room.find({ isActive: true })
        .sort({ code: 1 })
        .select('-__v')
        .lean();

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
  }
};

module.exports = roomController;