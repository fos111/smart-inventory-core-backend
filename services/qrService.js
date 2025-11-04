const QRCode = require('qrcode');
const Equipment = require('../models/Equipment');

class QRService {
  /**
   * Generate QR code with equipment URL
   */
  static async generateForEquipment(equipmentId, options = {}) {
    try {
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) {
        throw new Error('Equipment not found');
      }

      // Generate equipment URL
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const equipmentUrl = `${baseUrl}/equipment/${equipmentId}`;

      // QR code options
      const defaultOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',  // Black dots
          light: '#FFFFFF'  // White background
        },
        ...options
      };

      // Generate QR code as data URL (base64 image)
      const qrCodeDataURL = await QRCode.toDataURL(equipmentUrl, defaultOptions);

      // Store QR data in equipment
      equipment.qrCode = {
        data: equipmentUrl,        // The URL that QR code contains
        generatedAt: new Date(),
        lastScanned: null
      };
      
      await equipment.save();

      return {
        success: true,
        qrCode: qrCodeDataURL,    // Base64 image data
        equipmentUrl: equipmentUrl, // The URL for testing
        equipment: {
          id: equipment._id,
          name: equipment.name,
          serialNumber: equipment.serialNumber
        }
      };

    } catch (error) {
      console.error('QR generation error:', error);
      throw new Error(`QR generation failed: ${error.message}`);
    }
  }

  /**
   * Generate QR codes for multiple equipment items
   */
  static async generateBatch(equipmentIds, options = {}) {
    const results = [];
    
    for (const equipmentId of equipmentIds) {
      try {
        const result = await this.generateForEquipment(equipmentId, options);
        results.push({ 
          success: true, 
          equipmentId,
          ...result 
        });
      } catch (error) {
        results.push({ 
          success: false, 
          equipmentId, 
          error: error.message 
        });
      }
    }

    return results;
  }

  /**
   * Track QR code scan (for analytics)
   */
  static async trackScan(equipmentId) {
    try {
      await Equipment.findByIdAndUpdate(equipmentId, {
        'qrCode.lastScanned': new Date()
      });
    } catch (error) {
      console.error('Scan tracking error:', error);
    }
  }
}

module.exports = QRService;