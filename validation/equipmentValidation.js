const Joi = require('joi');

const equipmentCreateSchema = Joi.object({
  // Core Identification
  name: Joi.string().required().min(1).max(100),
  model: Joi.string().required().min(1),
  serialNumber: Joi.string().required().min(1),
  assetTag: Joi.string().optional().allow(''),
  
  // Classification
  category: Joi.string().required().valid(
    'computers', 'networking', 'lab-equipment', 
    'medical', 'industrial', 'office-equipment',
    'vehicles', 'tools', 'safety-equipment', 
    'furniture', 'electronics', 'other'
  ),
  subCategory: Joi.string().optional().allow(''),
  tags: Joi.array().items(Joi.string()),
  
  // Specifications
  specifications: Joi.object({
    manufacturer: Joi.string().required(),
    modelYear: Joi.number().integer().min(1900).max(2030),
    weight: Joi.number().min(0),
    dimensions: Joi.object({
      length: Joi.number().min(0),
      width: Joi.number().min(0),
      height: Joi.number().min(0),
      unit: Joi.string().valid('cm', 'm', 'in', 'ft')
    }),
    powerRequirements: Joi.string(),
    operatingTemperature: Joi.string(),
    capacity: Joi.string()
  }).required(),
  
  // Status & Location
  status: Joi.string().valid(
    'available', 'in-use', 'maintenance', 'out-of-service', 
    'retired', 'reserved', 'lost'
  ),
  condition: Joi.string().valid('excellent', 'good', 'fair', 'poor', 'critical'),
  location: Joi.object({
    building: Joi.string(),
    floor: Joi.string(),
    room: Joi.string(),
    department: Joi.string(),
    specificLocation: Joi.string()
  }),
  
  // Financial
  purchaseInfo: Joi.object({
    purchaseDate: Joi.date(),
    purchasePrice: Joi.number().min(0),
    purchaseOrder: Joi.string(),
    vendor: Joi.object({
      name: Joi.string(),
      contact: Joi.string()
    })
  }),
  
  notes: Joi.string().max(1000).allow('')
});

const equipmentUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  status: Joi.string().valid(
    'available', 'in-use', 'maintenance', 'out-of-service', 
    'retired', 'reserved', 'lost'
  ),
  condition: Joi.string().valid('excellent', 'good', 'fair', 'poor', 'critical'),
  location: Joi.object({
    building: Joi.string(),
    floor: Joi.string(),
    room: Joi.string(),
    department: Joi.string(),
    specificLocation: Joi.string()
  }),
  assignedTo: Joi.object({
    userName: Joi.string(),
    department: Joi.string()
  }),
  notes: Joi.string().max(1000).allow('')
});

const generateQRSchema = Joi.object({
  width: Joi.number().min(100).max(1000).default(300),
  margin: Joi.number().min(1).max(10).default(2)
});

const batchQRSchema = Joi.object({
  equipmentIds: Joi.array().items(Joi.string().hex().length(24)).required().min(1),
  options: Joi.object({
    width: Joi.number().min(100).max(1000),
    margin: Joi.number().min(1).max(10)
  })
});

module.exports = {
  equipmentCreateSchema,
  equipmentUpdateSchema,
  generateQRSchema,
  batchQRSchema
};