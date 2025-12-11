const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin Schema - Sistem yöneticileri (birden çok admin olabilir)
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin adı zorunlu'],
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
      select: false, // Password sorgusu yapıldığında select('+password') gerekli
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Password hashing middleware
adminSchema.pre('save', async function (next) {
  // Sadece password değiştirilmişse hash yap
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
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
