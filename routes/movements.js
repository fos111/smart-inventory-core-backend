const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');

// POST /api/movements/equipment/:equipmentId/move - Déplacer un équipement
router.post('/equipment/:equipmentId/move', movementController.moveEquipment);

// GET /api/movements/equipment/:equipmentId/history - Historique des mouvements
router.get('/equipment/:equipmentId/history', movementController.getMovementHistory);

// POST /api/movements/rfid-detection - Détection RFID automatique
router.post('/rfid-detection', movementController.handleRFIDDetection);

module.exports = router;