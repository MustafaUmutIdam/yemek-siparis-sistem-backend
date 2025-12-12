/**
 * Order Routes
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const orderService = require('../services/orderService');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// Consumer creates order
router.post('/', authenticateToken, requireRole('consumer'), [
  body('restaurantId').notEmpty(),
  body('items').isArray({ min: 1 }),
  body('deliveryLocation').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errorResponse('Validation error', 'VALIDATION_ERROR', 400));

    const consumerId = req.user.userId;
    const { restaurantId, items, deliveryLocation, paymentMethod } = req.body;
    const order = await orderService.createOrder(consumerId, restaurantId, items, deliveryLocation, paymentMethod);
    res.status(201).json(successResponse(order, 'Order created'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create an order (consumer)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - items
 *               - deliveryLocation
 *             properties:
 *               restaurantId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               deliveryLocation:
 *                 type: object
 *     responses:
 *       201:
 *         description: Order created
 */

// Get order (consumer/owner/courier) - role-aware
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { userId, role } = req.user;
    const order = await orderService.getOrderByIdForUser(userId, role, req.params.id);
    res.status(200).json(successResponse(order, 'Order fetched'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order by id (role-aware)
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
 *         description: Order details
 */

// Owner confirm or cancel
router.patch('/:id/confirm', authenticateToken, requireRole('owner'), async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const { accept = true } = req.body;
    const order = await orderService.ownerConfirmOrder(ownerId, req.params.id, accept);
    res.status(200).json(successResponse(order, 'Order status updated'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}/confirm:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Owner confirm or cancel order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accept:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Order status updated
 */

// Owner assign courier
router.patch('/:id/assign', authenticateToken, requireRole('owner'), [
  body('courierId').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errorResponse('Validation error', 'VALIDATION_ERROR', 400));

    const ownerId = req.user.userId;
    const { courierId } = req.body;
    const order = await orderService.ownerAssignCourier(ownerId, req.params.id, courierId);
    res.status(200).json(successResponse(order, 'Courier assigned'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}/assign:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Owner assign courier to order
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
 *               - courierId
 *             properties:
 *               courierId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Courier assigned
 */

// Courier update status
router.patch('/:id/status', authenticateToken, requireRole('courier'), [
  body('status').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errorResponse('Validation error', 'VALIDATION_ERROR', 400));

    const courierId = req.user.userId;
    const { status } = req.body;
    const order = await orderService.courierUpdateStatus(courierId, req.params.id, status);
    res.status(200).json(successResponse(order, 'Order status updated'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Courier update order status
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */

module.exports = router;