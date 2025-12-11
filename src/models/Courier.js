const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Courier Schema - Kuryeler
const courierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Kurye adı zorunlu'],
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
      default: 'courier',
      enum: ['courier'],
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restorant ID zorunlu'],
      // Patron kendine ait kuryeleri görebilecek
      // Kurye yönetimi buradan yapılacak
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    status: {
      type: String,
      enum: ['offline', 'online', 'break', 'on_delivery'],
      default: 'offline',
      // offline: çalışmıyor
      // online: hazır
      // break: molada
      // on_delivery: siparişte
    },
    totalDeliveries: {
      type: Number,
      default: 0,
      // Toplam teslim edilen paket sayısı
    },
    deliveries: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        count: {
          type: Number,
          default: 1,
        },
        // 1 ayda ve günde kaç paket götürdüğünü görmek için
      },
    ],
    rating: {
      type: Number,
      default: 5,
      min: [1, 'Rating minimum 1 olmalı'],
      max: [5, 'Rating maksimum 5 olmalı'],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    vehicle: {
      type: String,
      enum: ['motorcycle', 'bicycle', 'car', 'scooter'],
      // Taşıt türü
    },
    vehiclePlate: String,
      // Araç plakalı
    isVerified: {
      type: Boolean,
      default: false,
      // Admin tarafından onaylanıp onaylanmadığı
    },
  },
  { timestamps: true }
);

// GeoJSON index oluştur (konum bazlı sorgular için)
courierSchema.index({ currentLocation: '2dsphere' });

// Password hashing middleware
courierSchema.pre('save', async function (next) {
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
courierSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Courier', courierSchema);
