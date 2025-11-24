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
    enum: ['labo', 'bureau', 'salle-de-reunion', 'entrepot', 'autre'],
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
roomSchema.index({ code: 1 });
roomSchema.index({ building: 1 });
roomSchema.index({ department: 1 });
roomSchema.index({ type: 1 });

module.exports = mongoose.model('Room', roomSchema);