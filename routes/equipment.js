const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { 
  equipmentCreateSchema, 
  equipmentUpdateSchema,
  generateQRSchema,
  batchQRSchema
} = require('../validation/equipmentValidation');

// GET /api/equipment - Get all equipment with optional filters
router.get('/', equipmentController.getAllEquipment);

// GET /api/equipment/:id - Get equipment by ID
router.get('/:id', equipmentController.getEquipmentById);

// POST /api/equipment - Create new equipment
router.post('/', validateRequest(equipmentCreateSchema), equipmentController.createEquipment);

// PUT /api/equipment/:id - Update equipment
router.put('/:id', validateRequest(equipmentUpdateSchema), equipmentController.updateEquipment);

// DELETE /api/equipment/:id - Soft delete equipment
router.delete('/:id', equipmentController.deleteEquipment);


//QR Code Generation Routes
router.post('/:id/generate-qr', validateRequest(generateQRSchema), equipmentController.generateQRCode);
router.post('/batch/generate-qr', validateRequest(batchQRSchema), equipmentController.generateBatchQR);
router.post('/:id/track-scan', equipmentController.trackQRScan);

module.exports = router;