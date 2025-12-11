# Yemek Sipariş Sistemi Backend

Node.js, Express ve MongoDB kullanarak geliştirilmiş bir yemek sipariş sistemi backend API'si.

## Teknolojiler

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Token authentication
- **bcryptjs** - Password hashing
- **Joi** - Data validation

## Proje Açıklaması

Restorant sipariş sistemi 4 farklı kullanıcı tipini içerir:

1. **Admin** - Sistem yöneticileri (patron hesaplarını yönetir)
2. **Owner (Patron)** - Restorant sahibi (menü, siparişleri yönetir)
3. **Courier (Kurye)** - Siparişleri teslim eden kişiler
4. **Consumer (Tüketici)** - Sipariş veren müşteriler

### Sistem Özellikleri

- ✅ Admin tarafından patron hesap yönetimi
- ✅ Patron kendi restorantını ve menüsünü yönetebilir
- ✅ Patron kuryeleri kendi restorantına atayabilir
- ✅ Konum bazlı restorant araması
- ✅ Sipariş durum takibi (harita üzerinde)
- ✅ Kapıda ödeme sistemi
- ✅ Sipariş durum geçmişi ve notlar

## Kurulum

### Gereksinimler
- Node.js (v14+)
- MongoDB (yerel veya Cloud)
- npm veya yarn

### Adımlar

1. Projeyi klonlayın
```bash
git clone <repo-url>
cd yemek-siparis-sistem-backend
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. Ortam değişkenlerini ayarlayın
```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyin
```env
MONGODB_URI=mongodb://localhost:27017/yemek-siparis-sistem
JWT_SECRET=your-secret-key-here
```

5. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

Sunucu `http://localhost:5000` adresinde çalışacaktır.

## Proje Yapısı

```
src/
├── config/         # Veritabanı ve JWT konfigürasyonları
├── controllers/    # İstek işleyicileri
├── services/       # İş mantığı
├── models/         # MongoDB şemaları
├── routes/         # API rotaları
├── middlewares/    # Özel middleware'ler
├── utils/          # Yardımcı fonksiyonlar
├── constants/      # Sabitler
└── index.js        # Uygulama giriş noktası

tests/             # Test dosyaları
```

## Database Modelleri

### 1. Admin (Yönetici)
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String,
  isActive: Boolean,
  role: 'admin'
}
```

### 2. Owner (Patron)
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String,
  isActive: Boolean,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  maxCouriers: Number,
  subscriptionPaymentInfo: Object,
  role: 'owner'
}
```

### 3. Restaurant (Restorant)
```javascript
{
  name: String,
  description: String,
  address: String,
  phone: String,
  isOpen: Boolean,
  location: GeoJSON (Point),
  ownerId: ObjectId (ref: Owner),
  rating: Number,
  deliveryTime: Number,
  minimumOrder: Number,
  deliveryFee: Number
}
```

### 4. Product (Ürün)
```javascript
{
  name: String,
  price: Number,
  description: String,
  category: String,
  restaurantId: ObjectId (ref: Restaurant),
  image: String,
  isAvailable: Boolean,
  vegetarian: Boolean,
  spicy: Boolean
}
```

### 5. Courier (Kurye)
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String,
  restaurantId: ObjectId (ref: Restaurant),
  currentLocation: GeoJSON (Point),
  status: Enum (offline, online, break, on_delivery),
  totalDeliveries: Number,
  vehicle: String,
  isVerified: Boolean,
  role: 'courier'
}
```

### 6. Consumer (Tüketici)
```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String,
  address: String,
  location: GeoJSON (Point),
  favoriteRestaurants: [ObjectId],
  savedAddresses: Array,
  role: 'consumer'
}
```

### 7. Order (Sipariş)
```javascript
{
  orderNumber: String (unique),
  deliveryLocation: GeoJSON (Point),
  consumerId: ObjectId (ref: Consumer),
  courierId: ObjectId (ref: Courier),
  restaurantId: ObjectId (ref: Restaurant),
  items: Array,
  status: Enum (pending, confirmed, preparing, on_way, delivered, cancelled),
  totalPrice: Number,
  finalPrice: Number,
  paymentMethod: Enum (cash, card, meal_card),
  statusHistory: Array,
  rating: Object
}
```

## Kullanılabilir Komutlar

- `npm run dev` - Geliştirme modu (nodemon ile)
- `npm start` - Üretim modu
- `npm test` - Testleri çalıştır
- `npm run test:models` - Model ve database bağlantısını test et
- `npm run lint` - Linting
- `npm run format` - Kod formatlama

## API Endpoints

### Health Check
```
GET /health - Sunucu durumu
GET /api/v1/health/db - Database bağlantı durumu
```

### Authentication (TBD)
```
POST /api/v1/auth/admin/login - Admin girişi
POST /api/v1/auth/owner/login - Patron girişi
POST /api/v1/auth/consumer/register - Tüketici kaydı
POST /api/v1/auth/consumer/login - Tüketici girişi
```

## Ortam Değişkenleri

`.env.example` dosyasını referans alın ve gerekli değişkenleri ayarlayın.

| Değişken | Açıklama |
|----------|----------|
| `MONGODB_URI` | MongoDB bağlantı URL'si |
| `JWT_SECRET` | JWT gizli anahtarı |
| `JWT_EXPIRE` | JWT token'ın geçerliliği süresi |
| `PORT` | Sunucu portu |
| `NODE_ENV` | Çalışma ortamı (development/production) |
| `CORS_ORIGIN` | CORS izin verilen alan |

## Lisans

MIT

