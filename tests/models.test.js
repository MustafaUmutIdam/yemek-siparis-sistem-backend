// Database models test script
// Modellerin ve bağlantının doğru çalışıp çalışmadığını test eder

const mongoose = require('mongoose');
require('dotenv').config();

// Models'ı import et - models klasöründen direkt require
const Admin = require('../src/models/Admin');
const Owner = require('../src/models/Owner');
const Restaurant = require('../src/models/Restaurant');
const Product = require('../src/models/Product');
const Courier = require('../src/models/Courier');
const Consumer = require('../src/models/Consumer');
const Order = require('../src/models/Order');

async function testModels() {
  try {
    console.log('🔌 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB bağlantısı başarılı!');

    // Test koleksiyonları
    console.log('\n📋 Koleksiyonlar test ediliyor...\n');

    const collections = [
      { name: 'Admin', model: Admin },
      { name: 'Owner', model: Owner },
      { name: 'Restaurant', model: Restaurant },
      { name: 'Product', model: Product },
      { name: 'Courier', model: Courier },
      { name: 'Consumer', model: Consumer },
      { name: 'Order', model: Order },
    ];

    for (const coll of collections) {
      const count = await coll.model.countDocuments();
      console.log(`✓ ${coll.name}: ${count} document`);
    }

    console.log('\n✅ Tüm model testleri başarılı!');

    // Model schema bilgisi
    console.log('\n📊 Model Şemalar:');
    console.log('==================\n');

    console.log('Admin Fields:', Object.keys(Admin.schema.paths).filter((k) => k !== '__v'));
    console.log('Owner Fields:', Object.keys(Owner.schema.paths).filter((k) => k !== '__v'));
    console.log('Restaurant Fields:', Object.keys(Restaurant.schema.paths).filter((k) => k !== '__v'));
    console.log('Product Fields:', Object.keys(Product.schema.paths).filter((k) => k !== '__v'));
    console.log('Courier Fields:', Object.keys(Courier.schema.paths).filter((k) => k !== '__v'));
    console.log('Consumer Fields:', Object.keys(Consumer.schema.paths).filter((k) => k !== '__v'));
    console.log('Order Fields:', Object.keys(Order.schema.paths).filter((k) => k !== '__v'));

    await mongoose.disconnect();
    console.log('\n🔌 Bağlantı kapatıldı.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

testModels();
