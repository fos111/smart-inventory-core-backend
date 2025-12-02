const express = require('express');
const router = express.Router();
const locationChangeController = require('../controllers/locationChangeController');

router.post('/', locationChangeController.createLocationChangeRequest);
router.get('/pending', locationChangeController.getPendingRequests);
router.put('/:id/approve', locationChangeController.approveLocationChange);
router.put('/:id/reject', locationChangeController.rejectLocationChange);
router.get('/history/:equipmentId', locationChangeController.getEquipmentLocationHistory);

module.exports = router;