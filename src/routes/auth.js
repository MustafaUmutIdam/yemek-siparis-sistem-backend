/**
 * Authentication Routes
 * POST /api/v1/auth/admin-login - Admin girişi
 * POST /api/v1/auth/owner-login - Owner girişi
 * POST /api/v1/auth/consumer-login - Consumer girişi
 * POST /api/v1/auth/courier-login - Kurye girişi
 * POST /api/v1/auth/consumer-register - Consumer kayıdı
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');
const { errorResponse, successResponse } = require('../utils/response');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/admin-login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Admin girişi
 *     description: Admin e-posta ve şifre ile sisteme girer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin123!
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *       400:
 *         description: Hatalı istek
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */
router.post(
  '/admin-login',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
    body('password').notEmpty().withMessage('Şifre gereklidir')
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

      const { email, password } = req.body;
      const result = await authService.adminLogin(email, password);

      res.status(200).json(
        successResponse(result, 'Admin başarıyla giriş yaptı')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/auth/owner-login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Owner (Patron) girişi
 *     description: Owner e-posta ve şifre ile sisteme girer. Abonelik kontrolü yapılır
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: owner@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Owner123!
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *       400:
 *         description: Hatalı istek
 *       401:
 *         description: Geçersiz kimlik bilgileri veya abonelik süresi dolmuş
 */
router.post(
  '/owner-login',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
    body('password').notEmpty().withMessage('Şifre gereklidir')
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

      const { email, password } = req.body;
      const result = await authService.ownerLogin(email, password);

      res.status(200).json(
        successResponse(result, 'Owner başarıyla giriş yaptı')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/auth/consumer-login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Consumer (Tüketici) girişi
 *     description: Consumer e-posta ve şifre ile sisteme girer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: consumer@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Consumer123!
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *       400:
 *         description: Hatalı istek
 *       401:
 *         description: Geçersiz kimlik bilgileri
 */
router.post(
  '/consumer-login',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
    body('password').notEmpty().withMessage('Şifre gereklidir')
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

      const { email, password } = req.body;
      const result = await authService.consumerLogin(email, password);

      res.status(200).json(
        successResponse(result, 'Consumer başarıyla giriş yaptı')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/auth/courier-login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Kurye girişi
 *     description: Kurye e-posta ve şifre ile sisteme girer. Hesap doğrulanmış olmalıdır
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: courier@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Courier123!
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *       400:
 *         description: Hatalı istek
 *       401:
 *         description: Geçersiz kimlik bilgileri veya hesap onaylanmamış
 */
router.post(
  '/courier-login',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
    body('password').notEmpty().withMessage('Şifre gereklidir')
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

      const { email, password } = req.body;
      const result = await authService.courierLogin(email, password);

      res.status(200).json(
        successResponse(result, 'Kurye başarıyla giriş yaptı')
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/auth/consumer-register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Consumer (Tüketici) kayıdı
 *     description: Yeni bir consumer hesabı oluştur
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
 *               - passwordConfirm
 *               - name
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newconsumer@example.com
 *               phone:
 *                 type: string
 *                 example: "5551234567"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Consumer123!
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *                 example: Consumer123!
 *               name:
 *                 type: string
 *                 example: Ahmet Yılmaz
 *               address:
 *                 type: string
 *                 example: Ankara, Türkiye
 *     responses:
 *       201:
 *         description: Başarılı kayıt
 *       400:
 *         description: Hatalı istek veya e-posta zaten var
 */
router.post(
  '/consumer-register',
  [
    body('email').isEmail().withMessage('Geçerli bir e-posta giriniz'),
    body('phone').notEmpty().withMessage('Telefon numarası gereklidir'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
    body('passwordConfirm').notEmpty().withMessage('Şifre onayı gereklidir'),
    body('name').notEmpty().withMessage('Ad soyad gereklidir'),
    body('address').notEmpty().withMessage('Adres gereklidir')
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

      const result = await authService.consumerRegister(req.body);

      res.status(201).json(
        successResponse(result, 'Consumer başarıyla kayıt oldu')
      );
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
