const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Owner (Patron) Schema - Restorant sahipleri
const ownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patron adı zorunlu'],
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
      default: 'owner',
      enum: ['owner'],
    },
    isActive: {
      type: Boolean,
      default: true,
      // Üyeliği bitince admin tarafından false yapılacak
    },
    subscriptionStartDate: {
      type: Date,
      default: Date.now,
      // Üyelik başlangıç tarihi
    },
    subscriptionEndDate: {
      type: Date,
      // Üyelik bitiş tarihi (opsiyonel)
    },
    maxCouriers: {
      type: Number,
      default: 5,
      // Maksimum kurye sayısı
    },
    subscriptionPaymentInfo: {
      // Abone ödeme bilgisi
      paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'other'],
      },
      lastPaymentDate: Date,
      nextPaymentDate: Date,
      amount: Number,
      currency: {
        type: String,
        default: 'TRY',
      },
    },
  },
  { timestamps: true }
);

// Password hashing middleware
ownerSchema.pre('save', async function (next) {
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
ownerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Owner', ownerSchema);
