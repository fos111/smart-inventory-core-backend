const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code de la salle est requis'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Le nom de la salle est requis'],
    trim: true
  },
  building: {
    type: String,
    required: [true, 'Le bâtiment est requis'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Le département est requis'],
    trim: true
  },
  type: {
    type: String,
    enum: ['labo', 'bureau', 'salle-de-reunion', 'class', 'autre'],
    default: 'labo'
  },
  capacity: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    maxlength: 500
  },

  rfidReaders: [{
    readerId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    readerType: {
      type: String,
      enum: ['entrance', 'exit', 'both'],
      default: 'both'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastSeen: Date,
    installationDate: Date,
    location: {
      type: String,
      enum: ['door', 'window', 'ceiling', 'wall', 'other'],
      default: 'door'
    },
    notes: String
  }],

  rfidStats: {
    totalDetections: {
      type: Number,
      default: 0
    },
    lastDetection: Date,
    equipmentCount: {
      type: Number,
      default: 0
    },
    movementsToday: {
      type: Number,
      default: 0
    }
  },

  status: {
    type: String,
    enum: ['active', 'maintenance', 'closed', 'reserved'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },

  contact: {
    responsible: String,
    email: String,
    phone: String
  },

  tags: [String],
  features: [{
    type: String,
    enum: ['wifi', 'projector', 'air-conditioning', 'whiteboard', 'computers', 'power-outlets']
  }]
}, {
  timestamps: true
});

roomSchema.virtual('activeRFIDReaders').get(function() {
  return this.rfidReaders.filter(reader => reader.isActive);
});

roomSchema.virtual('equipmentCount').get(async function() {
  const Equipment = mongoose.model('Equipment');
  const count = await Equipment.countDocuments({
    'location.room': this._id,
    isActive: true
  });
  return count;
});

roomSchema.methods.addRFIDReader = function(readerData) {
  const reader = {
    readerId: readerData.readerId.toUpperCase(),
    readerType: readerData.readerType || 'both',
    installationDate: readerData.installationDate || new Date(),
    location: readerData.location || 'door',
    notes: readerData.notes
  };

  this.rfidReaders.push(reader);
  return this.save();
};

roomSchema.methods.deactivateRFIDReader = function(readerId) {
  const reader = this.rfidReaders.find(r => r.readerId === readerId.toUpperCase());
  if (reader) {
    reader.isActive = false;
    return this.save();
  }
  throw new Error(`Lecteur RFID ${readerId} non trouvé`);
};

roomSchema.methods.updateRFIDStats = function() {
  const Equipment = mongoose.model('Equipment');
  
  return Equipment.countDocuments({
    'location.room': this._id,
    isActive: true
  }).then(count => {
    this.rfidStats.equipmentCount = count;
    return this.save();
  });
};

roomSchema.methods.incrementRFIDDetections = function() {
  this.rfidStats.totalDetections += 1;
  this.rfidStats.lastDetection = new Date();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (!this.rfidStats.lastDetection || this.rfidStats.lastDetection < today) {
    this.rfidStats.movementsToday = 0;
  }
  
  this.rfidStats.movementsToday += 1;
  return this.save();
};

roomSchema.statics.findByRFIDReader = function(readerId) {
  return this.findOne({
    'rfidReaders.readerId': readerId.toUpperCase(),
    'rfidReaders.isActive': true
  });
};

roomSchema.statics.findRoomsWithRFID = function() {
  return this.find({
    'rfidReaders.0': { $exists: true },
    isActive: true
  });
};

roomSchema.statics.findByBuilding = function(building) {
  return this.find({
    building: new RegExp(building, 'i'),
    isActive: true
  });
};

roomSchema.statics.findByType = function(type) {
  return this.find({
    type: type,
    isActive: true
  });
};

roomSchema.pre('save', function(next) {
  if (this.code) {
    this.code = this.code.toUpperCase();
  }
  next();
});

roomSchema.index({ code: 1 });
roomSchema.index({ building: 1 });
roomSchema.index({ department: 1 });
roomSchema.index({ type: 1 });
roomSchema.index({ 'rfidReaders.readerId': 1 });
roomSchema.index({ 'rfidStats.lastDetection': -1 });

module.exports = mongoose.model('Room', roomSchema);