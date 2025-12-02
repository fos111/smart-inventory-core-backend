const mongoose = require('mongoose');  // <-- AJOUTE CETTE LIGNE MANQUANTE !

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
  duration: Number,
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

const movementHistorySchema = new mongoose.Schema({
  fromRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  toRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  movedAt: {
    type: Date,
    default: Date.now
  },
  movedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    enum: ['manual', 'rfid_auto', 'maintenance', 'transfer', 'other'],
    default: 'manual'
  },
  detectedByRFID: {
    type: Boolean,
    default: false
  },
  rfidReaderId: String,
  notes: String
}, {
  timestamps: true
});

const equipmentSchema = new mongoose.Schema({
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
    uppercase: true,
    index: true
  },
  assetTag: { 
    type: String, 
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
    index: true
  },
  
  rfidTag: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
    index: true
  },
  rfidStatus: {
    type: String,
    enum: ['active', 'inactive', 'lost', 'replaced'],
    default: 'active'
  },
  lastRFIDDetection: Date,
  
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
  
  status: {
    type: String,
    enum: [
      'available', 'in-use', 'maintenance', 'out-of-service', 
      'retired', 'reserved', 'lost', 'in-transit'
    ],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'good'
  },
  
  location: {
    building: String,
    floor: String,
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    roomCode: {
      type: String,
      index: true
    },
    department: String,
    specificLocation: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updateMethod: {
      type: String,
      enum: ['manual', 'rfid_auto', 'qr_scan', 'system'],
      default: 'manual'
    }
  },
  
  movementHistory: [movementHistorySchema],
  currentMovement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movement'
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
  
  maintenance: {
    schedule: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'as-needed']
    },
    serviceInterval: Number,
    lastMaintenanceDate: Date,
    nextMaintenanceDate: Date,
    maintenanceHistory: [maintenanceRecordSchema],
    totalMaintenanceCost: {
      type: Number,
      default: 0
    }
  },
  
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
  
  qrCode: {
    data: String,
    generatedAt: Date,
    lastScanned: Date
  },
  
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
  },
  
  // CHAMP AJOUTÉ POUR LE SYSTÈME DE VALIDATION HIÉRARCHIQUE
  pendingLocationChange: {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LocationChangeRequest'
    },
    requestedLocation: {
      building: String,
      room: String,
      department: String
    },
    requestedAt: Date
  }
}, {
  timestamps: true
});

// Virtuals
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

equipmentSchema.virtual('timeInCurrentLocation').get(function() {
  if (!this.location.lastUpdated) return 0;
  const lastUpdate = new Date(this.location.lastUpdated);
  const now = new Date();
  return Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
});

// Methods
equipmentSchema.methods.moveToRoom = async function(newRoomId, movedBy = null, reason = "manual", rfidData = null) {
  const oldRoomId = this.location.room;
  
  const movementRecord = {
    fromRoom: oldRoomId,
    toRoom: newRoomId,
    movedBy: movedBy,
    reason: reason,
    detectedByRFID: rfidData ? true : false,
    rfidReaderId: rfidData ? rfidData.readerId : null,
    notes: rfidData ? `Détection RFID automatique - Lecteur: ${rfidData.readerId}` : null
  };
  
  this.movementHistory.push(movementRecord);
  this.location.room = newRoomId;
  this.location.lastUpdated = new Date();
  this.location.updateMethod = rfidData ? 'rfid_auto' : 'manual';
  
  if (this.status === 'in-transit') {
    this.status = 'available';
  }
  
  const Room = mongoose.model('Room');
  const newRoom = await Room.findById(newRoomId);
  if (newRoom) {
    this.location.roomCode = newRoom.code;
    this.location.building = newRoom.building;
    this.location.department = newRoom.department;
  }
  
  if (rfidData) {
    this.lastRFIDDetection = new Date();
  }
  
  return this.save();
};

equipmentSchema.methods.markAsInTransit = async function(destinationRoomId = null, movedBy = null) {
  this.status = 'in-transit';
  
  if (destinationRoomId) {
    this.movementHistory.push({
      fromRoom: this.location.room,
      toRoom: destinationRoomId,
      movedBy: movedBy,
      reason: 'in_transit',
      notes: 'Équipement en cours de déplacement'
    });
  }
  
  return this.save();
};

equipmentSchema.methods.assignRFIDTag = async function(rfidTag) {
  this.rfidTag = rfidTag;
  this.rfidStatus = 'active';
  return this.save();
};

equipmentSchema.methods.deactivateRFID = async function() {
  this.rfidStatus = 'inactive';
  return this.save();
};

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

// Statics
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

equipmentSchema.statics.findByRoom = function(roomId) {
  return this.find({ 
    'location.room': roomId, 
    isActive: true 
  }).populate('location.room', 'code name building');
};

equipmentSchema.statics.findByRFIDTag = function(rfidTag) {
  return this.findOne({ 
    rfidTag: rfidTag.toUpperCase(),
    isActive: true 
  });
};

equipmentSchema.statics.findNoRecentRFID = function(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.find({
    rfidStatus: 'active',
    $or: [
      { lastRFIDDetection: { $lt: cutoffDate } },
      { lastRFIDDetection: null }
    ],
    isActive: true
  });
};

// Pre-save middleware
equipmentSchema.pre('save', function(next) {
  if (this.location.roomCode) {
    this.location.roomCode = this.location.roomCode.toUpperCase();
  }
  if (this.rfidTag) {
    this.rfidTag = this.rfidTag.toUpperCase();
  }
  next();
});

// Indexes
equipmentSchema.index({ 'location.room': 1, status: 1 });
equipmentSchema.index({ 'location.roomCode': 1, isActive: 1 });
equipmentSchema.index({ rfidTag: 1, rfidStatus: 1 });
equipmentSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);