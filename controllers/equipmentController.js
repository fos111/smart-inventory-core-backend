const Equipment = require('../models/Equipment');
const QRService = require('../services/qrService'); 
const equipmentController = {
  // Create new equipment
  createEquipment: async (req, res) => {
    try {
      console.log('📦 Received create request with body:', req.body);
      
      // Check if required fields are present
      if (!req.body.serialNumber) {
        return res.status(400).json({
          success: false,
          error: 'serialNumber is required'
        });
      }

      // Convert serialNumber and assetTag to uppercase
      req.body.serialNumber = req.body.serialNumber.toUpperCase();
      if (req.body.assetTag) {
        req.body.assetTag = req.body.assetTag.toUpperCase();
      }

      console.log('🔄 Creating equipment with data:', req.body);

      const equipment = new Equipment(req.body);
      await equipment.save();

      console.log('✅ Equipment created successfully:', equipment._id);

      res.status(201).json({ 
        success: true, 
        message: 'Equipment created successfully',
        equipment: {
          id: equipment._id,
          name: equipment.name,
          model: equipment.model,
          serialNumber: equipment.serialNumber,
          category: equipment.category
        }
      });
    } catch (error) {
      console.error('❌ Error creating equipment:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({ 
          success: false, 
          error: `${field} already exists` 
        });
      }
      
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Get all equipment with optional filtering
  getAllEquipment: async (req, res) => {
    try {
      const { 
        category, 
        status, 
        condition, 
        department,
        search 
      } = req.query;
      
      const query = { isActive: true };
      
      // Build query based on filters
      if (category) query.category = category;
      if (status) query.status = status;
      if (condition) query.condition = condition;
      if (department) query['location.department'] = new RegExp(department, 'i');
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
          { serialNumber: { $regex: search, $options: 'i' } },
          { assetTag: { $regex: search, $options: 'i' } },
          { 'specifications.manufacturer': { $regex: search, $options: 'i' } }
        ];
      }

      const equipment = await Equipment.find(query)
        .sort({ createdAt: -1 })
        .select('-__v');

      res.json({ 
        success: true, 
        equipment 
      });
    } catch (error) {
      console.error('❌ Error fetching equipment:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Get equipment by ID
  getEquipmentById: async (req, res) => {
    try {
      const equipment = await Equipment.findById(req.params.id)
        .select('-__v');

      if (!equipment) {
        return res.status(404).json({ 
          success: false, 
          error: 'Equipment not found' 
        });
      }

      // Add virtuals to response
      const equipmentObj = equipment.toObject();
      equipmentObj.ageInMonths = equipment.ageInMonths;
      equipmentObj.maintenanceStatus = equipment.maintenanceStatus;

      res.json({ 
        success: true, 
        equipment: equipmentObj 
      });
    } catch (error) {
      console.error('❌ Error fetching equipment by ID:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Update equipment
  updateEquipment: async (req, res) => {
    try {
      const equipment = await Equipment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!equipment) {
        return res.status(404).json({ 
          success: false, 
          error: 'Equipment not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Equipment updated successfully',
        equipment: {
          id: equipment._id,
          name: equipment.name,
          status: equipment.status,
          condition: equipment.condition
        }
      });
    } catch (error) {
      console.error('❌ Error updating equipment:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Soft delete equipment
  deleteEquipment: async (req, res) => {
    try {
      const equipment = await Equipment.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!equipment) {
        return res.status(404).json({ 
          success: false, 
          error: 'Equipment not found' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Equipment deleted successfully' 
      });
    } catch (error) {
      console.error('❌ Error deleting equipment:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },
  generateQRCode: async (req, res) => {
    try {
      const { id } = req.params;
      const { width = 300, margin = 2 } = req.body;

      console.log(`🔗 Generating QR code for equipment: ${id}`);

      const result = await QRService.generateForEquipment(id, {
        width: parseInt(width),
        margin: parseInt(margin)
      });

      res.json({
        success: true,
        message: 'QR code generated successfully',
        ...result
      });

    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Generate QR codes for multiple equipment items
   */
  generateBatchQR: async (req, res) => {
    try {
      const { equipmentIds, options = {} } = req.body;

      if (!equipmentIds || !Array.isArray(equipmentIds)) {
        return res.status(400).json({
          success: false,
          error: 'equipmentIds array is required'
        });
      }

      console.log(`🔗 Generating batch QR codes for ${equipmentIds.length} equipment items`);

      const results = await QRService.generateBatch(equipmentIds, options);

      res.json({
        success: true,
        message: 'Batch QR code generation completed',
        results
      });

    } catch (error) {
      console.error('❌ Error in batch QR generation:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Track QR code scan (for mobile app)
   */
  trackQRScan: async (req, res) => {
    try {
      const { id } = req.params;

      await QRService.trackScan(id);

      res.json({
        success: true,
        message: 'QR scan tracked successfully'
      });

    } catch (error) {
      console.error('❌ Error tracking QR scan:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = equipmentController;