const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET /api/rooms - Obtenir toutes les salles
router.get('/', roomController.getAllRooms);

// GET /api/rooms/with-rfid - Obtenir les salles avec lecteurs RFID
router.get('/with-rfid', roomController.getRoomsWithRFID);

// GET /api/rooms/type/:type - Obtenir les salles par type
router.get('/type/:type', roomController.getRoomsByType);

// GET /api/rooms/building/:building - Obtenir les salles par bâtiment
router.get('/building/:building', roomController.getRoomsByBuilding);

// GET /api/rooms/:id - Obtenir une salle spécifique
router.get('/:id', roomController.getRoomById);

// POST /api/rooms - Créer une nouvelle salle
router.post('/', roomController.createRoom);

// PATCH /api/rooms/:id/rfid-readers - Ajouter un lecteur RFID
router.patch('/:id/rfid-readers', roomController.addRFIDReader);

// GET /api/rooms/:id/rfid-stats - Obtenir les statistiques RFID
router.get('/:id/rfid-stats', roomController.getRFIDStats);

module.exports = router;