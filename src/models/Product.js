const mongoose = require('mongoose');

// Product Schema - Ürünler
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ürün adı zorunlu'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Fiyat zorunlu'],
      min: [0, 'Fiyat negatif olamaz'],
    },
    description: {
      type: String,
      // Kısa içerik/açıklama
    },
    category: {
      type: String,
      required: [true, 'Kategori zorunlu'],
      // Örn: Burger, Pizza, Salad, vb.
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restorant ID zorunlu'],
      // Restoran bu ürünleri listelenebilecek
      // Patron kendi restoranından bu ürünleri yönetebilecek
    },
    image: {
      type: String,
      // Ürün resmi URL'si
    },
    isAvailable: {
      type: Boolean,
      default: true,
      // Ürünün mevcut olup olmadığı
    },
    preparationTime: {
      type: Number,
      // Hazırlama süresi (dakika cinsinden)
    },
    ingredients: {
      type: [String],
      // Malzeme listesi
    },
    calories: {
      type: Number,
      // Kalori bilgisi (opsiyonel)
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
    spicy: {
      type: Boolean,
      default: false,
      // Acı olup olmadığı
    },
    vegetarian: {
      type: Boolean,
      default: false,
      // Vejetaryen olup olmadığı
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
