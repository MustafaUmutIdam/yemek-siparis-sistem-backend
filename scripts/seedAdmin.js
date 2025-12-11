/**
 * İlk Admin Kullanıcısını Oluştur
 * Komut: node scripts/seedAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Admin } = require('../src/models');
const { hashPassword } = require('../src/utils/password');

const seedAdmin = async () => {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB bağlantısı başarılı');

    // Admin zaten var mı kontrol et
    const existingAdmin = await Admin.findOne({ email: 'admin@yemeksiparis.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin zaten mevcut:', existingAdmin.email);
      await mongoose.connection.close();
      return;
    }

    // Yeni admin oluştur
    const adminData = {
      email: 'admin@yemeksiparis.com',
      phone: '5551234567',
      password: 'Admin123!', // Middleware'de hash'lenecek
      name: 'Sistem Yöneticisi',
      role: 'admin',
      isActive: true
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('✅ Admin başarıyla oluşturuldu!');
    console.log('📧 E-posta: admin@yemeksiparis.com');
    console.log('🔐 Şifre: Admin123!');
    console.log('\n⚠️  ÖNEMLİ: Üretim ortamında parolayı değiştirin!');

    await mongoose.connection.close();
    console.log('\n🔌 Bağlantı kapatıldı');
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
};

seedAdmin();
