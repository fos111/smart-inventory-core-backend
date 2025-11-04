const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  type: { 
    type: String, 
    enum: ['preventive', 'corrective', 'inspection', 'calibration', 'repair'],
    required: true 
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 500 
  },
  technician: { 
    name: { type: String, required: true },
    contact: String 
  },
  cost: { 
    type: Number, 
    min: 0 
  },
  duration: Number, // in hours
  partsUsed: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
  nextMaintenanceDate: Date,
  status: {
    type: String,
    enum: ['completed', 'scheduled', 'in-progress', 'cancelled'],
    default: 'completed'
  }
}, { 
  timestamps: true 
});

const equipmentSchema = new mongoose.Schema({
  // Core Identification
  name: { 
    type: String, 
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  model: { 
    type: String, 
    required: [true, 'Equipment model is required'],
    trim: true 
  },
  serialNumber: { 
    type: String, 
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    uppercase: true 
  },
  assetTag: { 
    type: String, 
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true 
  },
  
  // Classification & Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'computers', 'networking', 'lab-equipment', 
      'medical', 'industrial', 'office-equipment',
      'vehicles', 'tools', 'safety-equipment', 
      'furniture', 'electronics', 'other'
    ]
  },
  subCategory: String,
  tags: [String],
  
  // Specifications
  specifications: {
    manufacturer: { 
      type: String, 
      required: true 
    },
    modelYear: Number,
    weight: { 
      type: Number, 
      min: 0 
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, default: 'cm' }
    },
    powerRequirements: String,
    operatingTemperature: String,
    capacity: String,
    additionalSpecs: mongoose.Schema.Types.Mixed
  },
  
  // Status & Condition
  status: {
    type: String,
    enum: [
      'available', 'in-use', 'maintenance', 'out-of-service', 
      'retired', 'reserved', 'lost'
    ],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  
  // Location & Assignment
  location: {
    building: String,
    floor: String,
    room: String,
    department: String,
    specificLocation: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  assignedTo: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    department: String,
    dateAssigned: Date
  },
  
  // Financial & Ownership
  ownership: {
    type: String,
    enum: ['owned', 'leased', 'rented', 'borrowed'],
    default: 'owned'
  },
  purchaseInfo: {
    purchaseDate: Date,
    purchasePrice: { type: Number, min: 0 },
    purchaseOrder: String,
    vendor: {
      name: String,
      contact: String,
      warranty: {
        expires: Date,
        terms: String
      }
    }
  },
  currentValue: { type: Number, min: 0 },
  depreciationRate: Number,
  
  // Maintenance & Service
  maintenance: {
    schedule: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'as-needed']
    },
    serviceInterval: Number, // in days
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    maintenanceHistory: [maintenanceRecordSchema],
    totalMaintenanceCost: {
      type: Number,
      default: 0
    }
  },
  
  // Usage & Lifecycle
  usage: {
    totalOperatingHours: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    usageCount: {
      type: Number,
      default: 0
    },
    meterReadings: [{
      date: Date,
      reading: Number,
      unit: String
    }]
  },
  
  // Safety & Compliance
  safety: {
    requiresCertification: Boolean,
    lastInspectionDate: Date,
    nextInspectionDate: Date,
    inspectionStatus: {
      type: String,
      enum: ['passed', 'failed', 'pending'],
      default: 'pending'
    },
    safetyNotes: String,
    certifications: [{
      name: String,
      issued: Date,
      expires: Date,
      issuingAuthority: String
    }]
  },
  
  // Digital Assets
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  images: [String],
  
  // QR Code System
  qrCode: {
    data: String,
    generatedAt: Date
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});



// Virtual Fields
equipmentSchema.virtual('ageInMonths').get(function() {
  if (!this.purchaseInfo?.purchaseDate) return 0;
  const purchaseDate = new Date(this.purchaseInfo.purchaseDate);
  const now = new Date();
  const diffTime = Math.abs(now - purchaseDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
});

equipmentSchema.virtual('maintenanceStatus').get(function() {
  if (!this.maintenance.nextMaintenanceDate) return 'no-schedule';
  const today = new Date();
  const nextMaintenance = new Date(this.maintenance.nextMaintenanceDate);
  const diffTime = nextMaintenance - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'due-soon';
  return 'on-schedule';
});

// Instance Methods
equipmentSchema.methods.addMaintenanceRecord = function(recordData) {
  this.maintenance.maintenanceHistory.push(recordData);
  this.maintenance.lastMaintenanceDate = recordData.date;
  
  if (recordData.nextMaintenanceDate) {
    this.maintenance.nextMaintenanceDate = recordData.nextMaintenanceDate;
  }
  
  if (recordData.cost) {
    this.maintenance.totalMaintenanceCost += recordData.cost;
  }
  
  return this.save();
};

equipmentSchema.methods.updateUsage = function(hours = 1, meterReading = null) {
  this.usage.totalOperatingHours += hours;
  this.usage.lastUsed = new Date();
  this.usage.usageCount += 1;
  
  if (meterReading) {
    this.usage.meterReadings.push({
      date: new Date(),
      reading: meterReading,
      unit: 'hours'
    });
  }
  
  return this.save();
};

equipmentSchema.methods.generateQRData = function() {
  return JSON.stringify({
    equipmentId: this._id.toString(),
    serialNumber: this.serialNumber,
    assetTag: this.assetTag,
    name: this.name,
    type: 'equipment'
  });
};

// Static Methods
equipmentSchema.statics.findDueForMaintenance = function() {
  const today = new Date();
  return this.find({
    'maintenance.nextMaintenanceDate': { $lte: today },
    'status': { $in: ['available', 'in-use'] },
    'isActive': true
  });
};

equipmentSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

equipmentSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

module.exports = mongoose.model('Equipment', equipmentSchema);