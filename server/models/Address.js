const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    label: {
      type: String,
      required: [true, 'Please provide an address label (e.g., Home, Work, Other)'],
      trim: true,
    },
    fullAddress: {
      type: String,
      required: [true, 'Please provide the full address'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Please provide the area or locality'],
      trim: true,
    },
    houseFlatBuilding: {
      type: String,
      required: [true, 'Please provide the house, flat or building details'],
      trim: true,
    },
    floorLandmark: {
      type: String,
      trim: true,
      default: '',
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    latitude: {
      type: Number,
      required: [true, 'Please provide latitude coordinates'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide longitude coordinates'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure fast queries for user addresses
addressSchema.index({ user: 1, isDefault: -1, createdAt: -1 });

module.exports = mongoose.model('Address', addressSchema);
