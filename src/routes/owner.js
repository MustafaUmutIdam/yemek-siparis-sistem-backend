/**
 * Owner Routes
 * Owner kendi restoranlarını yönetir
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const ownerService = require('../services/ownerService');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// All routes require authenticated owner
router.use(authenticateToken);
router.use(requireRole('owner'));

/**
 * @swagger
 * /api/v1/owner/restaurants:
 *   post:
 *     tags:
 *       - Owner
 *     summary: Create a restaurant
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               isOpen:
 *                 type: boolean
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *     responses:
 *       201:
 *         description: Restaurant created
 */
router.post(
  '/restaurants',
  [
    body('name').notEmpty().withMessage('name is required'),
    body('address').notEmpty().withMessage('address is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errorResponse('Validation error', 'VALIDATION_ERROR', 400));

      const ownerId = req.user.userId;
      const restaurant = await ownerService.createRestaurant(ownerId, req.body);

      res.status(201).json(successResponse(restaurant, 'Restaurant created'));
    } catch (error) {
      next(error);
    }
  }
);

router.get('/restaurants', async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const result = await ownerService.getRestaurantsByOwner(ownerId, parseInt(page), parseInt(limit));
    res.status(200).json(successResponse(result, 'Restaurants fetched'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/owner/restaurants:
 *   get:
 *     tags:
 *       - Owner
 *     summary: List restaurants for owner
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
 *         description: Restaurants list
 */

router.get('/restaurants/:id', async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const restaurant = await ownerService.getRestaurantById(ownerId, req.params.id);
    res.status(200).json(successResponse(restaurant, 'Restaurant fetched'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/owner/restaurants/{id}:
 *   get:
 *     tags:
 *       - Owner
 *     summary: Get restaurant details
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
 *         description: Restaurant details
 */

router.patch('/restaurants/:id', async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const restaurant = await ownerService.updateRestaurant(ownerId, req.params.id, req.body);
    res.status(200).json(successResponse(restaurant, 'Restaurant updated'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/owner/restaurants/{id}:
 *   patch:
 *     tags:
 *       - Owner
 *     summary: Update a restaurant
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
 *         description: Restaurant updated
 */

router.delete('/restaurants/:id', async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const result = await ownerService.deleteRestaurant(ownerId, req.params.id);
    res.status(200).json(successResponse(result, 'Restaurant deleted'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/owner/restaurants/{id}:
 *   delete:
 *     tags:
 *       - Owner
 *     summary: Delete a restaurant
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
 *         description: Restaurant deleted
 */

module.exports = router;