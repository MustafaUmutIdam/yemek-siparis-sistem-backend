<!--
Yemek Sipariş Sistem Backend için AI agent talimatları
Restorant sipariş sistemi 4 kategoriye sahip: Admin, Owner (Patron), Courier (Kurye), Consumer (Tüketici)
-->

# Copilot / AI Agent Instructions

Amaç: AI kodlama ajanlarının bu depoda hızlı üretken olmasına yardımcı olmak.

## 1) Proje Temel Bilgileri

- **Dil**: Node.js / JavaScript (Açıklamalar Türkçe)
- **Ana giriş**: `src/index.js`
- **Başlangıç komutu**: `npm run dev` (geliştirme), `npm start` (üretim)
- **Veritabanı**: MongoDB (Mongoose ODM kullanılıyor)
- **Kimlik doğrulama**: JWT (JSON Web Token)
- **Proje Türü**: Restorant Sipariş Sistemi (4 kullanıcı türü)

## 2) Büyük Resim - Sistem Mimarisi

### 4 Kullanıcı Kategorisi:
1. **Admin** - Sistem yöneticileri (patron hesaplarını yönetir)
2. **Owner (Patron)** - Restorant sahipleri (menü, siparişleri yönetir)
3. **Courier (Kurye)** - Siparişleri teslim eden kişiler
4. **Consumer (Tüketici)** - Sipariş veren müşteriler

### Request Flow:
```
Routes (src/routes/) 
  → Controllers (src/controllers/)
    → Services (src/services/)
      → Models/Database (src/models/)
```

### 7 Ana Model (Veri Tabanı Yapısı):
- **Admin** - Sistem yöneticileri (birden çok admin olabilir)
- **Owner** - Patron bilgileri ve subscription detayları
- **Restaurant** - Restorant bilgileri (ownerId ile linklenecek)
- **Product** - Ürünler (restaurantId ile linklenecek)
- **Courier** - Kurye bilgileri (restaurantId ile linklenecek)
- **Consumer** - Tüketici bilgileri
- **Order** - Sipariş bilgileri ve durum takibi

### Katmanlar:
- **Routes** (`src/routes/`): HTTP endpoint'leri tanımla (Express router)
  - `/api/v1/auth/*` - Girişler (admin, owner, consumer)
  - `/api/v1/admin/*` - Admin işlemleri
  - `/api/v1/owner/*` - Patron işlemleri
  - `/api/v1/restaurants/*` - Restorant bilgileri
  - `/api/v1/products/*` - Ürün işlemleri
  - `/api/v1/couriers/*` - Kurye yönetimi
  - `/api/v1/consumers/*` - Tüketici işlemleri
  - `/api/v1/orders/*` - Sipariş işlemleri

- **Controllers** (`src/controllers/`): Request/Response işleme, input validation
- **Services** (`src/services/`): Business logic - tüm iş kuralları burada
- **Models** (`src/models/`): Mongoose şemaları (Admin, Owner, Restaurant, vb.)
  - Model dosyaları: Admin.js, Owner.js, Restaurant.js, Product.js, Courier.js, Consumer.js, Order.js
  - index.js - tüm modelleri export eder

- **Middlewares** (`src/middlewares/`): 
  - `auth.js` - JWT token doğrulama
  - `errorHandler.js` - Hata yönetimi
  - İlerde: role-based middleware (admin, owner, courier, consumer)

- **Config** (`src/config/`):
  - `database.js` - MongoDB bağlantı
  - `jwt.js` - Token generation ve verification

- **Utils** (`src/utils/`):
  - `password.js` - bcryptjs şifre hashing
  - `response.js` - Standardized API response şekli

- **Constants** (`src/constants/`):
  - HTTP kodları ve ERROR_CODES

## 3) Önemli Geliştirici Komutları

```bash
npm install           # Bağımlılık yükle
npm run dev          # Dev server (nodemon ile hot reload)
npm start            # Production server
npm test             # Test çalıştır (Jest)
npm run test:models  # Model ve database bağlantısını test et
npm run lint         # Code linting
npm run format       # Prettier formatting
```

## 4) Veritabanı Modelleri (Detaylı)

### Admin
- id, email (unique), phone, password, name, isActive, role (always 'admin')

### Owner (Patron)
- id, email, phone, password, name, isActive, role (always 'owner')
- subscriptionStartDate, subscriptionEndDate, maxCouriers, subscriptionPaymentInfo
- Patron kendi restoranına ownerId ile erişir

### Restaurant
- id, name, description, address, phone, isOpen, location (GeoJSON)
- ownerId (ref: Owner), rating, deliveryTime, minimumOrder, deliveryFee
- Restoran sayfasından kurye, ürün, sipariş ve gelir/gider tablosu erişilecek

### Product
- id, name, price, description, category, restaurantId (ref: Restaurant)
- image, isAvailable, vegetarian, spicy, rating
- Patron menüyü restoranından yönetebilecek

### Courier
- id, email, phone, password, name, role (always 'courier')
- restaurantId (ref: Restaurant), currentLocation (GeoJSON), status (offline/online/break/on_delivery)
- totalDeliveries, deliveries (array for tracking daily/monthly), rating
- Patron kuryeleri restoranından yönetebilecek

### Consumer
- id, email, phone, password, name, address, location (GeoJSON)
- favoriteRestaurants, savedAddresses, profileImage
- Tüketici kendi siparişlerini görebilecek

### Order
- id, orderNumber (unique), status (pending/confirmed/preparing/on_way/delivered/cancelled)
- deliveryLocation, consumerId, courierId, restaurantId
- items (array), totalPrice, finalPrice, paymentMethod (cash/card/meal_card)
- statusHistory (durum değişiklikleri kaydı), rating

## 5) Proje Spesifik Kurallar

### Response Şekli:
Tüm API endpoints standardized JSON dönmeli:
```javascript
// Başarı:
{ success: true, message: "...", data: {...} }

// Hata:
{ success: false, error: { code: "ERROR_CODE", message: "..." } }
```

### Controllers Yazma Kuralı:
- Controllers REQUEST/RESPONSE işleme yapmalı
- Business logic SERVICE'e gitmelidir
- Tüm validasyon controller'da yapılmalı
- Role kontrolleri middleware'de yapılacak

Örnek pattern (`src/controllers/auth.js`):
```javascript
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Validation here
    const result = await authService.login(email, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error); // Error handler'a gönder
  }
};
```

### Services Yazma Kuralı:
Services pure business logic olmalı (req/res bilmez)
```javascript
const login = async (email, password) => {
  const user = await Admin.findOne({ email }).select('+password');
  if (!user) throw new Error('Invalid credentials');
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid credentials');
  
  return { user, token: generateToken(user._id) };
};
```

## 6) Authentication ve Authorization

### Token System:
- Token generation: `src/config/jwt.js` kullan
- Token verify: middleware `src/middlewares/auth.js` ile
- Protected routes'ta: `authenticateToken` middleware kullan

### Role-Based Access (İlerde eklenecek):
```javascript
router.post('/owner/create', authenticateToken, requireRole('admin'), controllers.createOwner);
router.get('/owner/:id', authenticateToken, requireRole('owner'), controllers.getOwner);
```

### Environment Variables (`.env`):
```
JWT_SECRET=super-secret-key-change-in-production
JWT_EXPIRE=7d
MONGODB_URI=mongodb://localhost:27017/yemek-siparis-sistem
CORS_ORIGIN=http://localhost:3000
```

## 7) GeoJSON / Konum Bazlı Sorgular

Restorant, Kurye, Tüketici ve Sipariş konumları GeoJSON Point formatında:
```javascript
location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: [Number] // [longitude, latitude]
}

// Index oluşturulmuş: restaurantSchema.index({ location: '2dsphere' });
```

Yakındaki restoran sorgusu örneği:
```javascript
Restaurant.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lon, lat] },
      $maxDistance: 5000 // 5km
    }
  }
});
```

## 8) Dosya Oluştururken Checklist

Yeni bir feature eklerken:
- [ ] Route oluştur: `src/routes/<feature>.js`
- [ ] Controller oluştur: `src/controllers/<feature>.js`
- [ ] Service oluştur: `src/services/<feature>.js`
- [ ] Model varsa: `src/models/<Feature>.js` (PascalCase) - zaten oluşturuluyor
- [ ] `src/index.js`'de route'u register et
- [ ] Tests ekle: `tests/<feature>.test.js`
- [ ] Middleware (auth/role) ekle
- [ ] Error handling ekle

## 9) Test Etme

Model ve database bağlantısını test et:
```bash
npm run test:models
```

Jest testleri çalıştır:
```bash
npm test
```

## 10) Error Handling

- Custom errors throw et (descriptive message ile)
- `errorHandler` middleware tüm errors yakala
- Kodları: `src/constants/index.js` içinde ERROR_CODES define et

## 11) Order (Sipariş) İşlemi Flow

1. **pending**: Tüketici sipariş oluşturur, restoran beklemede
2. **confirmed**: Patron siparişi onaylar
3. **preparing**: Mutfakta hazırlama başlar
4. **on_way**: Kurye siparişi alıp yola çıkar
5. **delivered**: Siparişi teslim edilir
6. **cancelled**: İptal edilir (herhangi bir aşamada)

statusHistory array'i tüm değişiklikleri kaydeder: status, timestamp, changedBy (system/admin/owner/courier/consumer), note

## 12) Konum Takibi

- **Kurye**: Mobil uygulamada currentLocation güncellenir (real-time)
- **Tüketici**: Harita üzerinden kurye konumunu takip eder
- **Order**: sipariş.items[].location ve Order.deliveryLocation ile harita entegrasyonu

---

## Şu Anda Tamamlanan İşler:
✅ 7 Model oluşturuldu (Admin, Owner, Restaurant, Product, Courier, Consumer, Order)
✅ MongoDB bağlantısı yapılandırıldı
✅ JWT config hazırlandı
✅ Model test scripti oluşturuldu

## Sonraki Adımlar:
- [ ] Auth routes ve controllers (login, register)
- [ ] Role-based middleware
- [ ] Admin paneli routes ve controllers
- [ ] Owner (Patron) routes ve controllers
- [ ] Restaurant management routes
- [ ] Order management routes
- [ ] Courier routes
- [ ] Consumer routes
- [ ] Harita ve konum bazlı aramalar

---

Herhangi soru varsa, modellerin detaylı açıklamalarını README.md ve test ederek kontrol edebilirsin.


