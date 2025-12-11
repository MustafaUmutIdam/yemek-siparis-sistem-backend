const mongoose = require('mongoose');

// Restaurant Schema - Restoranlar
const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restorant adı zorunlu'],
      trim: true,
    },
    description: {
      type: String,
      // Kısa açıklama
    },
    address: {
      type: String,
      required: [true, 'Adres zorunlu'],
    },
    phone: {
      type: String,
      required: [true, 'Telefon zorunlu'],
    },
    isOpen: {
      type: Boolean,
      default: true,
      // Açık/kapalı durumu
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
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: [true, 'Patron ID zorunlu'],
      // Patron kendi ID'sine sahip olan restorana erişecek
    },
    cuisineType: {
      type: [String],
      // Mutfak türü (örn: Turkish, Italian, vb.)
    },
    image: {
      type: String,
      // Restorant resmi URL'si
    },
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
    deliveryTime: {
      type: Number,
      // Ortalama teslimat süresi (dakika cinsinden)
    },
    minimumOrder: {
      type: Number,
      default: 0,
      // Minimum sipariş tutarı
    },
    deliveryFee: {
      type: Number,
      default: 0,
      // Teslimat ücreti
    },
  },
  { timestamps: true }
);

// GeoJSON index oluştur (konum bazlı sorgular için)
restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
