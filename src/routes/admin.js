/**
 * Admin Routes
 * Admin paneli - Owner yönetimi
 */

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const adminService = require('../services/adminService');
const authService = require('../services/authService');
const { authenticateToken } = require('../middlewares/auth');
const { errorResponse, successResponse } = require('../utils/response');

const router = express.Router();

// Middleware: Admin doğrulama
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json(errorResponse(
      'Bu işlem için admin yetkisi gereklidir',
      'FORBIDDEN',
      403
    ));
  }
  next();
};

/**
 * @swagger
 * /api/v1/admin/owners:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Tüm owner'ları listele
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Owner listesi
 *       401:
 *         description: Kimlik doğrulama gereklidir
 *       403:
 *         description: Admin yetkisi gereklidir
 */
router.get('/owners', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const result = await adminService.getAllOwners(parseInt(page), parseInt(limit));
    
    res.status(200).json(
      successResponse(result, 'Owner listesi başarıyla alındı')
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/admin/owners/{id}:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Owner detaylarını getir
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Owner detayları
 *       404:
 *         description: Owner bulunamadı
 */
router.get('/owners/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const owner = await adminService.getOwnerById(req.params.id);
    
    res.status(200).json(
      successResponse(owner, 'Owner detayları başarıyla alındı')
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/admin/owners/create:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Yeni owner oluştur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: owner@example.com
 *               phone:
 *                 type: string
 *                 example: "5551234567"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Owner123!
 *               name:
 *                 type: string
 *                 example: Ahmet Restoran
 *               subscriptionStartDate:
 *                 type: string
 *                 format: date-time
 *               subscriptionEndDate:
 *                 type: string
 *                 format: date-time
 *               maxCouriers:
 *                 type: integer
 *                 default: 5
 *     responses:
 *       201:
 *         description: Owner başarıyla oluşturuldu
 *       400:
 *         description: Hatalı istek
 */
router.post(
  '/owners/create',
  authenticateToken,
  requireAdmin,
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
    body('phone').notEmpty().withMessage('Telefon numarası gereklidir'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
    body('name').notEmpty().withMessage('Ad gereklidir')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errorResponse(
          'Validation hatası',
          'VALIDATION_ERROR',
          400
        ));
      }

      const owner = await adminService.createOwner(req.body);

      res.status(201).json(
        successResponse(owner, 'Owner başarıyla oluşturuldu')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/owners/{id}/update:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Owner'ı güncelle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               name:
 *                 type: string
 *               maxCouriers:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               subscriptionStartDate:
 *                 type: string
 *                 format: date-time
 *               subscriptionEndDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Owner başarıyla güncellendi
 *       404:
 *         description: Owner bulunamadı
 */
router.patch(
  '/owners/:id/update',
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const owner = await adminService.updateOwner(req.params.id, req.body);

      res.status(200).json(
        successResponse(owner, 'Owner başarıyla güncellendi')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/owners/{id}/deactivate:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Owner'ı deaktif et
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Owner deaktif edildi
 *       404:
 *         description: Owner bulunamadı
 */
router.patch(
  '/owners/:id/deactivate',
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const result = await adminService.deactivateOwner(req.params.id);

      res.status(200).json(
        successResponse(result, 'Owner deaktif edildi')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/owners/{id}/activate:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Owner'ı aktif et
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Owner aktif edildi
 *       404:
 *         description: Owner bulunamadı
 */
router.patch(
  '/owners/:id/activate',
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const result = await adminService.activateOwner(req.params.id);

      res.status(200).json(
        successResponse(result, 'Owner aktif edildi')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/owners/{id}/extend-subscription:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Owner aboneliğini uzat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEndDate
 *             properties:
 *               newEndDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Abonelik uzatıldı
 *       404:
 *         description: Owner bulunamadı
 */
router.patch(
  '/owners/:id/extend-subscription',
  authenticateToken,
  requireAdmin,
  [
    body('newEndDate').isISO8601().withMessage('Geçerli bir tarih giriniz')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(errorResponse(
          'Validation hatası',
          'VALIDATION_ERROR',
          400
        ));
      }

      const result = await adminService.extendSubscription(req.params.id, req.body.newEndDate);

      res.status(200).json(
        successResponse(result, 'Abonelik başarıyla uzatıldı')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/owners/{id}/subscription-status:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Owner'ın abonelik durumunu kontrol et
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Abonelik durumu
 *       404:
 *         description: Owner bulunamadı
 */
router.get(
  '/owners/:id/subscription-status',
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const status = await adminService.checkSubscriptionStatus(req.params.id);

      res.status(200).json(
        successResponse(status, 'Abonelik durumu başarıyla alındı')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/subscriptions/expired:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Süresi dolan abonelikleri listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Süresi dolan abonelikler listesi
 */
router.get(
  '/subscriptions/expired',
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const result = await adminService.getExpiredSubscriptions();

      res.status(200).json(
        successResponse(result, 'Süresi dolan abonelikler başarıyla alındı')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/subscriptions/expiring-soon:
 *   get:
 *     tags:
 *       - Admin
 *     summary: 7 gün içinde süresi dolacak abonelikleri listele
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Süresi yaklaşan abonelikler listesi
 */
router.get(
  '/subscriptions/expiring-soon',
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const result = await adminService.getSoonToExpireSubscriptions();

      res.status(200).json(
        successResponse(result, 'Süresi yaklaşan abonelikler başarıyla alındı')
      );
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
