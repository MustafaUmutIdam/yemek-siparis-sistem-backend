const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Consumer Schema - Tüketiciler
const consumerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Adı zorunlu'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email zorunlu'],
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Geçerli bir email girin'],
    },
    phone: {
      type: String,
      required: [true, 'Telefon zorunlu'],
    },
    password: {
      type: String,
      required: [true, 'Şifre zorunlu'],
      minlength: [6, 'Şifre en az 6 karakter olmalı'],
      select: false,
    },
    role: {
      type: String,
      default: 'consumer',
      enum: ['consumer'],
    },
    address: {
      type: String,
      required: [true, 'Adres zorunlu'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Konum zorunlu'],
      },
    },
    profileImage: {
      type: String,
      // Profil resmi URL'si
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    favoriteRestaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
      },
    ],
    savedAddresses: [
      {
        label: String, // Home, Work, vb.
        address: String,
        location: {
          type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
          },
          coordinates: [Number],
        },
        isDefault: Boolean,
      },
    ],
  },
  { timestamps: true }
);

// GeoJSON index oluştur (konum bazlı sorgular için)
consumerSchema.index({ location: '2dsphere' });

// Password hashing middleware
consumerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password karşılaştırma metodu
consumerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Consumer', consumerSchema);
