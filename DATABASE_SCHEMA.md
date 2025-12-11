// Database Schema Documentation
// Tüm modellerin detaylı açıklaması

// ============================================
// 1. ADMIN - Sistem Yöneticileri
// ============================================
// Birden çok admin olabilir, admin hesapları sadece sistem yöneticileri tarafından oluşturulur

Admin Schema:
{
  _id: ObjectId,
  name: String (zorunlu),
  email: String (unique, zorunlu),
  phone: String (zorunlu),
  password: String (hashed, minimum 6 char),
  role: String (enum: 'admin', default: 'admin'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}

Adminler yapabilecekleri:
- Patron hesapları oluştur/düzenle/sil
- Sistem raporlarını görmek
- Genel istatistikler


// ============================================
// 2. OWNER (PATRON) - Restorant Sahibi
// ============================================
// Admin tarafından oluşturulur, sadece login ve kendi bilgilerini güncelleyebilir

Owner Schema:
{
  _id: ObjectId,
  name: String (zorunlu),
  email: String (unique, zorunlu),
  phone: String (zorunlu),
  password: String (hashed, minimum 6 char),
  role: String (enum: 'owner', default: 'owner'),
  isActive: Boolean (default: true), // Admin tarafından üyelik bitince false yapılır
  subscriptionStartDate: Date (default: now),
  subscriptionEndDate: Date (opsiyonel),
  maxCouriers: Number (default: 5), // Maksimum kurye sayısı
  subscriptionPaymentInfo: {
    paymentMethod: String (credit_card/bank_transfer/other),
    lastPaymentDate: Date,
    nextPaymentDate: Date,
    amount: Number,
    currency: String (default: TRY)
  },
  createdAt: Date,
  updatedAt: Date
}

Patronlar yapabilecekleri:
- Şifre değiştir
- Kendi bilgilerini güncelle
- Restorant oluştur/düzenle (sonraki aşama)
- Ürün ekle/düzenle/sil (sonraki aşama)
- Kuryeleri yönet (sonraki aşama)
- Siparişleri yönet (sonraki aşama)
- Gelir/gider tablosunu görmek (sonraki aşama)

NOT: Patron kendi ID'sine sahip olan restorana erişir


// ============================================
// 3. RESTAURANT - Restorant Bilgileri
// ============================================
// Patron tarafından oluşturulur, ownerId ile linklenecek

Restaurant Schema:
{
  _id: ObjectId,
  name: String (zorunlu),
  description: String (kısa açıklama, opsiyonel),
  address: String (zorunlu),
  phone: String (zorunlu),
  isOpen: Boolean (default: true), // Açık/kapalı durumu
  location: GeoJSON {
    type: String (enum: 'Point', default: 'Point'),
    coordinates: [Number] // [longitude, latitude]
  },
  ownerId: ObjectId (ref: Owner, zorunlu), // Patron bu restorana erişir
  cuisineType: [String] (Turkish, Italian, vb.),
  image: String (restorant resmi URL'si),
  rating: Number (default: 5, min: 1, max: 5),
  reviewCount: Number (default: 0),
  deliveryTime: Number (ortalama dakika cinsinden),
  minimumOrder: Number (default: 0),
  deliveryFee: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}

Index:
- location: '2dsphere' (konum bazlı sorgular için)

Restorant sayfasından erişilebilecekler:
- Kuryeleri görmek/yönetmek (restaurantId ile)
- Ürünleri görmek/yönetmek (restaurantId ile)
- Siparişleri görmek/yönetmek (restaurantId ile)
- Gelir/gider tablosunu görmek (restaurantId ile)


// ============================================
// 4. PRODUCT - Ürünler
// ============================================
// Patron tarafından kendi restoranına ürün ekler

Product Schema:
{
  _id: ObjectId,
  name: String (zorunlu),
  price: Number (zorunlu, min: 0),
  description: String (kısa içerik),
  category: String (zorunlu, örn: Burger, Pizza, Salad),
  restaurantId: ObjectId (ref: Restaurant, zorunlu),
  image: String (ürün resmi URL'si),
  isAvailable: Boolean (default: true),
  preparationTime: Number (dakika cinsinden),
  ingredients: [String] (malzeme listesi),
  calories: Number (opsiyonel),
  rating: Number (default: 5, min: 1, max: 5),
  reviewCount: Number (default: 0),
  spicy: Boolean (default: false),
  vegetarian: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}

NOT: Tüketici restoranı seçtiğinde bu restoranın ürünleri görülecek


// ============================================
// 5. COURIER - Kuryeler
// ============================================
// Patron tarafından kendi restoranına kurye ekler

Courier Schema:
{
  _id: ObjectId,
  name: String (zorunlu),
  email: String (unique, zorunlu),
  phone: String (zorunlu),
  password: String (hashed, minimum 6 char),
  role: String (enum: 'courier', default: 'courier'),
  restaurantId: ObjectId (ref: Restaurant, zorunlu), // Patron kuryeleri görebilir
  currentLocation: GeoJSON {
    type: String (enum: 'Point', default: 'Point'),
    coordinates: [Number] // [longitude, latitude]
  },
  status: String (offline/online/break/on_delivery, default: offline),
  totalDeliveries: Number (default: 0),
  deliveries: [{
    date: Date,
    count: Number
  }],
  rating: Number (default: 5, min: 1, max: 5),
  reviewCount: Number (default: 0),
  vehicle: String (motorcycle/bicycle/car/scooter),
  vehiclePlate: String (araç plakası),
  isVerified: Boolean (default: false), // Admin tarafından onaylanıp onaylanmadığı
  createdAt: Date,
  updatedAt: Date
}

Index:
- currentLocation: '2dsphere' (konum bazlı sorgular için)

Kuryeler yapabilecekleri (mobil app):
- Şifre değiştir
- Konum güncelle (real-time)
- Status güncelle (online/offline/break)
- Siparişleri kabul et/reddet
- Teslim durumunu güncelle


// ============================================
// 6. CONSUMER - Tüketiciler
// ============================================
// Web sitesinden kendisi kaydolur

Consumer Schema:
{
  _id: ObjectId,
  name: String (zorunlu),
  email: String (unique, zorunlu),
  phone: String (zorunlu),
  password: String (hashed, minimum 6 char),
  role: String (enum: 'consumer', default: 'consumer'),
  address: String (zorunlu),
  location: GeoJSON {
    type: String (enum: 'Point', default: 'Point'),
    coordinates: [Number] // [longitude, latitude]
  },
  profileImage: String (profil resmi URL'si),
  isEmailVerified: Boolean (default: false),
  isPhoneVerified: Boolean (default: false),
  favoriteRestaurants: [ObjectId] (ref: Restaurant),
  savedAddresses: [{
    label: String (Home, Work, vb.),
    address: String,
    location: GeoJSON Point,
    isDefault: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}

Index:
- location: '2dsphere' (konum bazlı sorgular için)

Tüketiciler yapabilecekleri (web app):
- Yakındaki restoranları ara/filtrele
- Restoran detayını görmek
- Ürünleri görmek
- Sipariş oluştur
- Siparişlerini görmek
- Kurye konumunu harita üzerinden takip etmek
- Favorilerine restorant ekle
- Adres kaydet


// ============================================
// 7. ORDER - Siparişler
// ============================================
// Tüketici tarafından oluşturulur

Order Schema:
{
  _id: ObjectId,
  orderNumber: String (unique, auto-generated, örn: ORD-202412-000001),
  deliveryLocation: GeoJSON {
    type: String (enum: 'Point', default: 'Point'),
    coordinates: [Number],
    address: String
  },
  consumerId: ObjectId (ref: Consumer, zorunlu),
  consumerName: String (tüketici adı),
  consumerPhone: String (tüketici telefonu),
  
  courierId: ObjectId (ref: Courier, opsiyonel), // Başlangıçta boş, atanır
  courierName: String (kurye adı),
  courierPhone: String (kurye telefonu),
  
  restaurantId: ObjectId (ref: Restaurant, zorunlu),
  restaurantName: String (restorant adı),
  restaurantPhone: String (restorant telefonu),
  
  items: [{
    productId: ObjectId (ref: Product),
    productName: String,
    price: Number,
    quantity: Number (default: 1),
    specialInstructions: String (acısız olsun vb.)
  }],
  
  status: String (pending/confirmed/preparing/on_way/delivered/cancelled, default: pending),
  // pending: Bekleme (restorana ulaşmadı)
  // confirmed: Onaylandı (patron onayladı)
  // preparing: Hazırlanıyor (mutfakta)
  // on_way: Yolda (kurye çıkış yaptı)
  // delivered: Teslim edildi
  // cancelled: İptal edildi
  
  totalPrice: Number (ürünlerin toplam fiyatı),
  deliveryFee: Number (default: 0),
  tax: Number (default: 0),
  discount: Number (default: 0),
  finalPrice: Number (toplam + teslimat + vergi - indirim),
  
  paymentMethod: String (cash/card/meal_card, default: cash),
  paymentStatus: String (pending/completed/failed, default: pending),
  
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  
  rating: {
    score: Number (1-5),
    review: String,
    ratedBy: String (consumer/courier/restaurant),
    ratedAt: Date
  },
  
  cancellationReason: String (iptal nedeni),
  notes: String (genel notlar),
  
  statusHistory: [{
    status: String,
    timestamp: Date,
    changedBy: String (system/admin/owner/courier/consumer),
    note: String
  }],
  
  createdAt: Date,
  updatedAt: Date
}

Sipariş Durumu Flow:
1. pending (tüketici oluştur) → restorana bildirim
2. confirmed (patron onaylar) → kurye atandı mı?
3. preparing (mutfakta) → kurye haberdar
4. on_way (kurye çıkış yaptı) → tüketici takip etmeye başlar
5. delivered (teslim edildi) → ödeme veya son durumu
6. cancelled (iptal, herhangi bir aşamada)

NOT: statusHistory array'i tüm durumu değişiklikleri kaydeder


// ============================================
// ERİŞİM MODELİ
// ============================================

ADMIN:
- GET /api/v1/admin/owners (tüm patronlar)
- POST /api/v1/admin/owners (patron oluştur)
- PUT /api/v1/admin/owners/:id (patron düzenle)
- DELETE /api/v1/admin/owners/:id (patron sil)

OWNER (Patron):
- GET /api/v1/owner/restaurants (kendi restoranları)
- GET /api/v1/owner/restaurants/:id/products (restoranın ürünleri)
- POST /api/v1/owner/restaurants/:id/products (ürün ekle)
- GET /api/v1/owner/restaurants/:id/couriers (restoranın kuryeleri)
- POST /api/v1/owner/restaurants/:id/couriers (kurye ekle)
- GET /api/v1/owner/restaurants/:id/orders (restoranın siparişleri)

COURIER (Kurye):
- GET /api/v1/courier/orders/pending (kendisine atanan siparişler)
- PATCH /api/v1/courier/orders/:id/status (sipariş durumu güncelle)

CONSUMER (Tüketici):
- GET /api/v1/consumer/restaurants (yakındaki restoranlar)
- GET /api/v1/consumer/orders (kendi siparişleri)
- POST /api/v1/consumer/orders (sipariş oluştur)
- GET /api/v1/consumer/orders/:id (sipariş detayı)
