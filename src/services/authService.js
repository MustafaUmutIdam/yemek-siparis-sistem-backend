/**
 * Authentication Service
 * Tüm kullanıcı türleri için giriş ve kayıt işlemleri
 */

const { Admin, Owner, Consumer, Courier } = require('../models');
const { generateToken } = require('../config/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

/**
 * Admin girişi
 */
const adminLogin = async (email, password) => {
  const admin = await Admin.findOne({ email }).select('+password');
  
  if (!admin) {
    throw new Error('Geçersiz e-posta veya şifre');
  }

  if (!admin.isActive) {
    throw new Error('Bu admin hesabı deaktif edilmiştir');
  }

  const isMatch = await comparePassword(password, admin.password);
  if (!isMatch) {
    throw new Error('Geçersiz e-posta veya şifre');
  }

  const token = generateToken(admin._id, 'admin');
  
  return {
    user: {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      phone: admin.phone,
      role: admin.role
    },
    token
  };
};

/**
 * Owner (Patron) girişi
 */
const ownerLogin = async (email, password) => {
  const owner = await Owner.findOne({ email }).select('+password');
  
  if (!owner) {
    throw new Error('Geçersiz e-posta veya şifre');
  }

  if (!owner.isActive) {
    throw new Error('Bu patron hesabı deaktif edilmiştir');
  }

  // Abonelik kontrol et
  const now = new Date();
  if (owner.subscriptionEndDate && owner.subscriptionEndDate < now) {
    throw new Error('Aboneliğinizin süresi dolmuştur. Lütfen admin ile iletişime geçiniz');
  }

  const isMatch = await comparePassword(password, owner.password);
  if (!isMatch) {
    throw new Error('Geçersiz e-posta veya şifre');
  }

  const token = generateToken(owner._id, 'owner');
  
  return {
    user: {
      id: owner._id,
      email: owner.email,
      name: owner.name,
      phone: owner.phone,
      role: owner.role,
      isSubscriptionActive: owner.subscriptionEndDate > now
    },
    token
  };
};

/**
 * Consumer (Tüketici) girişi
 */
const consumerLogin = async (email, password) => {
  const consumer = await Consumer.findOne({ email }).select('+password');
  
  if (!consumer) {
    throw new Error('Geçersiz e-posta veya şifre');
  }

  const isMatch = await comparePassword(password, consumer.password);
  if (!isMatch) {
    throw new Error('Geçersiz e-posta veya şifre');
  }

  const token = generateToken(consumer._id, 'consumer');
  
  return {
    user: {
      id: consumer._id,
      email: consumer.email,
      name: consumer.name,
      phone: consumer.phone,
      role: consumer.role,
      address: consumer.address,
      isEmailVerified: consumer.isEmailVerified
    },
    token
  };
};

/**
 * Kurye girişi
 */
const courierLogin = async (email, password) => {
  const courier = await Courier.findOne({ email }).select('+password');
  
  if (!courier) {
    throw new Error('Geçersiz e-posta veya şifre');
  }

  if (!courier.isVerified) {
    throw new Error('Hesabınız henüz onaylanmamıştır. Lütfen restoran sahibi ile iletişime geçiniz');
  }

  const isMatch = await comparePassword(password, courier.password);
  if (!isMatch) {
    throw new Error('Geçersiz e-posta veya şifre');
  }

  const token = generateToken(courier._id, 'courier');
  
  return {
    user: {
      id: courier._id,
      email: courier.email,
      name: courier.name,
      phone: courier.phone,
      role: courier.role,
      restaurantId: courier.restaurantId,
      status: courier.status
    },
    token
  };
};

/**
 * Consumer kaydı
 */
const consumerRegister = async (userData) => {
  const { email, phone, password, passwordConfirm, name, address } = userData;

  // E-posta zaten var mı?
  const existingConsumer = await Consumer.findOne({ email });
  if (existingConsumer) {
    throw new Error('Bu e-posta adresi zaten kayıtlıdır');
  }

  // Şifreler eşleş mi?
  if (password !== passwordConfirm) {
    throw new Error('Şifreler eşleşmemektedir');
  }

  // Yeni tüketici oluştur
  const consumer = new Consumer({
    email,
    phone,
    password, // Middleware'de hash'lenecek
    name,
    address,
    role: 'consumer'
  });

  await consumer.save();

  const token = generateToken(consumer._id, 'consumer');

  return {
    user: {
      id: consumer._id,
      email: consumer.email,
      name: consumer.name,
      phone: consumer.phone,
      role: consumer.role,
      address: consumer.address
    },
    token
  };
};

/**
 * Token doğrulaması
 */
const verifyToken = async (token) => {
  try {
    const { verifyToken: jwtVerify } = require('../config/jwt');
    const decoded = jwtVerify(token);
    return decoded;
  } catch (error) {
    throw new Error(`Token doğrulama hatası: ${error.message}`);
  }
};

module.exports = {
  adminLogin,
  ownerLogin,
  consumerLogin,
  courierLogin,
  consumerRegister,
  verifyToken
};
