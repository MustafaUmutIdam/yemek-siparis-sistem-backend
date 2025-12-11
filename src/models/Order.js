const mongoose = require('mongoose');

// Order Schema - Siparişler
const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      // Sipariş numarası (örn: ORD-2024-001)
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Teslimat konumu zorunlu'],
      },
      address: String,
    },
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consumer',
      required: [true, 'Tüketici ID zorunlu'],
      // Tüketici kendi siparişlerini görebilecek
    },
    consumerName: String,
    consumerPhone: String,

    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Courier',
      // Siparişe atanan kurye (opsiyonel, atanana kadar null olabilir)
    },
    courierName: String,
    courierPhone: String,

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restorant ID zorunlu'],
      // Sipariş restorana düşecek
    },
    restaurantName: String,
    restaurantPhone: String,

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
        specialInstructions: String,
        // Ürün hakkında özel notlar (acısız olsun vb.)
      },
    ],

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'on_way', 'delivered', 'cancelled'],
      default: 'pending',
      // pending: Bekleme (restorana ulaşmadı)
      // confirmed: Onaylandı (patron onayladı)
      // preparing: Hazırlanıyor (mutfakta)
      // on_way: Yolda (kurye çıkış yaptı)
      // delivered: Teslim edildi
      // cancelled: İptal edildi
    },

    totalPrice: {
      type: Number,
      required: [true, 'Toplam fiyat zorunlu'],
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      // Toplam fiyat + teslimat ücreti + vergi - indirim
    },

    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'meal_card'],
      default: 'cash',
      // Ödeme şekli: Kapıda nakit, kart, yemek kartı
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },

    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,

    rating: {
      score: {
        type: Number,
        min: [1, 'Rating minimum 1 olmalı'],
        max: [5, 'Rating maksimum 5 olmalı'],
      },
      review: String,
      ratedBy: {
        type: String,
        enum: ['consumer', 'courier', 'restaurant'],
      },
      ratedAt: Date,
    },

    cancellationReason: String,
    // İptal nedeni (patron/kurye/tüketici tarafından iptal edildiyse)

    notes: String,
    // Sipariş hakkında genel notlar

    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: String,
          enum: ['system', 'admin', 'owner', 'courier', 'consumer'],
        },
        note: String,
      },
    ],
    // Sipariş durum geçmişi
  },
  { timestamps: true }
);

// Sipariş numarası otomatik üretme
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
