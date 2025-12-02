const mongoose = require('mongoose');

const locationChangeRequestSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: [true, 'L\'équipement est requis']
  },
  
  equipmentInfo: {
    name: String,
    serialNumber: String,
    model: String
  },
  
  currentLocation: {
    building: String,
    room: String,
    department: String
  },
  
  requestedLocation: {
    building: {
      type: String,
      required: [true, 'Le bâtiment est requis']
    },
    room: {
      type: String,
      required: [true, 'La salle est requise']
    },
    department: String,
    specificLocation: String
  },
  
  requestType: {
    type: String,
    enum: ['transfer', 'repair', 'maintenance', 'inventory', 'other'],
    default: 'transfer'
  },
  
  reason: {
    type: String,
    required: [true, 'La raison du déplacement est requise'],
    maxlength: 500
  },
  
  requestedBy: {
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    department: String
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  reviewedBy: {
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    role: String
  },
  
  reviewDate: Date,
  reviewNotes: {
    type: String,
    maxlength: 500
  },
  
  requestedDate: {
    type: Date,
    default: Date.now
  },
  
  effectiveDate: Date,
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

locationChangeRequestSchema.index({ equipment: 1 });
locationChangeRequestSchema.index({ status: 1 });
locationChangeRequestSchema.index({ requestedBy: 1 });
locationChangeRequestSchema.index({ 'requestedLocation.room': 1 });
locationChangeRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LocationChangeRequest', locationChangeRequestSchema);
