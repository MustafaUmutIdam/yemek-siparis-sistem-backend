/**
 * Courier Routes
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const courierService = require('../services/courierService');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// Owner routes
router.use(authenticateToken);
router.use(requireRole('owner'));

router.post('/restaurants/:id/couriers', [
  body('name').notEmpty().withMessage('name is required'),
  body('phone').notEmpty().withMessage('phone is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errorResponse('Validation error', 'VALIDATION_ERROR', 400));

    const ownerId = req.user.userId;
    const restaurantId = req.params.id;
    const courier = await courierService.createCourier(ownerId, restaurantId, req.body);
    res.status(201).json(successResponse(courier, 'Courier created'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/couriers/restaurants/{id}/couriers:
 *   post:
 *     tags:
 *       - Couriers
 *     summary: Create a courier for a restaurant
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
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Courier created
 */

router.get('/restaurants/:id/couriers', async (req, res, next) => {
  try {
    const couriers = await courierService.getCouriersByRestaurant(req.params.id);
    res.status(200).json(successResponse(couriers, 'Couriers fetched'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/couriers/restaurants/{id}/couriers:
 *   get:
 *     tags:
 *       - Couriers
 *     summary: List couriers for a restaurant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Couriers list
 */

router.patch('/couriers/:id', async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const courier = await courierService.updateCourier(ownerId, req.params.id, req.body);
    res.status(200).json(successResponse(courier, 'Courier updated'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/couriers/couriers/{id}:
 *   patch:
 *     tags:
 *       - Couriers
 *     summary: Update a courier
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
 *     responses:
 *       200:
 *         description: Courier updated
 */

router.delete('/couriers/:id', async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const result = await courierService.deleteCourier(ownerId, req.params.id);
    res.status(200).json(successResponse(result, 'Courier deleted'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/couriers/couriers/{id}:
 *   delete:
 *     tags:
 *       - Couriers
 *     summary: Delete a courier
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
 *         description: Courier deleted
 */

module.exports = router;