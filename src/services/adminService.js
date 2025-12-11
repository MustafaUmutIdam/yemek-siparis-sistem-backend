/**
 * Admin Service
 * Owner (Patron) yönetimi ve abonelik kontrolü
 */

const { Owner } = require('../models');
const { hashPassword } = require('../utils/password');

/**
 * Tüm owner'ları listele
 */
const getAllOwners = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;
    
    const owners = await Owner.find()
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Owner.countDocuments();

    return {
      owners,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Owner listesi alınamadı: ${error.message}`);
  }
};

/**
 * Owner detaylarını getir
 */
const getOwnerById = async (ownerId) => {
  try {
    const owner = await Owner.findById(ownerId).select('-password');
    
    if (!owner) {
      throw new Error('Owner bulunamadı');
    }

    return owner;
  } catch (error) {
    throw new Error(`Owner detayı alınamadı: ${error.message}`);
  }
};

/**
 * Yeni owner oluştur (Admin tarafından)
 */
const createOwner = async (ownerData) => {
  try {
    const { email, phone, password, name, subscriptionStartDate, subscriptionEndDate, maxCouriers } = ownerData;

    // E-posta zaten var mı?
    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      throw new Error('Bu e-posta adresi zaten kayıtlıdır');
    }

    // Yeni owner oluştur
    const owner = new Owner({
      email,
      phone,
      password, // Middleware'de hash'lenecek
      name,
      role: 'owner',
      isActive: true,
      subscriptionStartDate: subscriptionStartDate || new Date(),
      subscriptionEndDate: subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
      maxCouriers: maxCouriers || 5,
      subscriptionPaymentInfo: {
        paymentMethod: 'other',
        lastPaymentDate: new Date(),
        nextPaymentDate: subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 0,
        currency: 'TRY'
      }
    });

    await owner.save();

    return {
      id: owner._id,
      email: owner.email,
      name: owner.name,
      phone: owner.phone,
      subscriptionStartDate: owner.subscriptionStartDate,
      subscriptionEndDate: owner.subscriptionEndDate,
      isActive: owner.isActive,
      maxCouriers: owner.maxCouriers
    };
  } catch (error) {
    throw new Error(`Owner oluşturulamadı: ${error.message}`);
  }
};

/**
 * Owner'ı güncelle
 */
const updateOwner = async (ownerId, updateData) => {
  try {
    const { email, phone, name, subscriptionStartDate, subscriptionEndDate, maxCouriers, isActive } = updateData;

    const owner = await Owner.findById(ownerId);
    if (!owner) {
      throw new Error('Owner bulunamadı');
    }

    // E-posta değiştiyse benzersizlik kontrol et
    if (email && email !== owner.email) {
      const existingOwner = await Owner.findOne({ email });
      if (existingOwner) {
        throw new Error('Bu e-posta adresi zaten kullanılmaktadır');
      }
      owner.email = email;
    }

    // Güncellenecek alanlar
    if (phone) owner.phone = phone;
    if (name) owner.name = name;
    if (maxCouriers !== undefined) owner.maxCouriers = maxCouriers;
    if (isActive !== undefined) owner.isActive = isActive;
    
    // Abonelik bilgileri
    if (subscriptionStartDate) owner.subscriptionStartDate = subscriptionStartDate;
    if (subscriptionEndDate) {
      owner.subscriptionEndDate = subscriptionEndDate;
      owner.subscriptionPaymentInfo.nextPaymentDate = subscriptionEndDate;
    }

    await owner.save();

    return {
      id: owner._id,
      email: owner.email,
      name: owner.name,
      phone: owner.phone,
      subscriptionStartDate: owner.subscriptionStartDate,
      subscriptionEndDate: owner.subscriptionEndDate,
      isActive: owner.isActive,
      maxCouriers: owner.maxCouriers,
      updatedAt: owner.updatedAt
    };
  } catch (error) {
    throw new Error(`Owner güncellenemedi: ${error.message}`);
  }
};

/**
 * Owner'ı sil (soft delete - isActive false)
 */
const deactivateOwner = async (ownerId) => {
  try {
    const owner = await Owner.findByIdAndUpdate(
      ownerId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!owner) {
      throw new Error('Owner bulunamadı');
    }

    return {
      message: 'Owner deaktif edildi',
      owner
    };
  } catch (error) {
    throw new Error(`Owner deaktif edilemedi: ${error.message}`);
  }
};

/**
 * Owner'ı aktif et
 */
const activateOwner = async (ownerId) => {
  try {
    const owner = await Owner.findByIdAndUpdate(
      ownerId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!owner) {
      throw new Error('Owner bulunamadı');
    }

    return {
      message: 'Owner aktif edildi',
      owner
    };
  } catch (error) {
    throw new Error(`Owner aktif edilemedi: ${error.message}`);
  }
};

/**
 * Abonelik uzat
 */
const extendSubscription = async (ownerId, newEndDate) => {
  try {
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      throw new Error('Owner bulunamadı');
    }

    owner.subscriptionEndDate = new Date(newEndDate);
    owner.subscriptionPaymentInfo.nextPaymentDate = new Date(newEndDate);
    owner.subscriptionPaymentInfo.lastPaymentDate = new Date();

    await owner.save();

    return {
      message: 'Abonelik uzatıldı',
      subscriptionStartDate: owner.subscriptionStartDate,
      subscriptionEndDate: owner.subscriptionEndDate,
      daysRemaining: Math.ceil((owner.subscriptionEndDate - new Date()) / (1000 * 60 * 60 * 24))
    };
  } catch (error) {
    throw new Error(`Abonelik uzatılamadı: ${error.message}`);
  }
};

/**
 * Owner'ın abonelik durumunu kontrol et
 */
const checkSubscriptionStatus = async (ownerId) => {
  try {
    const owner = await Owner.findById(ownerId).select('subscriptionStartDate subscriptionEndDate isActive');
    
    if (!owner) {
      throw new Error('Owner bulunamadı');
    }

    const now = new Date();
    const isSubscriptionActive = owner.subscriptionEndDate > now && owner.isActive;
    const daysRemaining = Math.ceil((owner.subscriptionEndDate - now) / (1000 * 60 * 60 * 24));

    return {
      ownerId: owner._id,
      isActive: owner.isActive,
      isSubscriptionActive,
      subscriptionStartDate: owner.subscriptionStartDate,
      subscriptionEndDate: owner.subscriptionEndDate,
      daysRemaining: Math.max(0, daysRemaining),
      expiresAt: owner.subscriptionEndDate
    };
  } catch (error) {
    throw new Error(`Abonelik durumu kontrol edilemedi: ${error.message}`);
  }
};

/**
 * Süresi dolan abonelikleri bul
 */
const getExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    const expiredOwners = await Owner.find({
      subscriptionEndDate: { $lt: now },
      isActive: true
    }).select('-password');

    return {
      count: expiredOwners.length,
      owners: expiredOwners
    };
  } catch (error) {
    throw new Error(`Süresi dolan abonelikler alınamadı: ${error.message}`);
  }
};

/**
 * Süresi 7 gün içinde dolacak abonelikleri bul
 */
const getSoonToExpireSubscriptions = async () => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const soonExpiredOwners = await Owner.find({
      subscriptionEndDate: { $gte: now, $lte: sevenDaysLater },
      isActive: true
    }).select('-password');

    return {
      count: soonExpiredOwners.length,
      owners: soonExpiredOwners
    };
  } catch (error) {
    throw new Error(`Süresi yaklaşan abonelikler alınamadı: ${error.message}`);
  }
};

module.exports = {
  getAllOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  deactivateOwner,
  activateOwner,
  extendSubscription,
  checkSubscriptionStatus,
  getExpiredSubscriptions,
  getSoonToExpireSubscriptions
};
