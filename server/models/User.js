const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    phone: {
      type: String,
      required: [
        function() { return this.role === 'provider'; },
        'Please provide a phone number for provider registration'
      ],
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer',
    },
    isApproved: {
      type: Boolean,
      default: true, // Providers are now auto-approved out of the box
    },
    isActive: {
      type: Boolean,
      default: true, // Used to track soft-deletion or blocking
    },
    avatar: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// --------------- Middleware ---------------

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --------------- Instance Methods ---------------

// Compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', userSchema);
