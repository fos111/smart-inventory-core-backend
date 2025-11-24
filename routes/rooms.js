const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET /api/rooms - Obtenir toutes les salles
router.get('/', roomController.getAllRooms);

// GET /api/rooms/type/:type - Obtenir les salles par type
router.get('/type/:type', roomController.getRoomsByType);

// GET /api/rooms/building/:building - Obtenir les salles par bâtiment
router.get('/building/:building', roomController.getRoomsByBuilding);

module.exports = router;