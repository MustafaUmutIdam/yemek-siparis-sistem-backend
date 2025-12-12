/**
 * Product Routes
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const productService = require('../services/productService');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

router.post('/restaurants/:id/products', authenticateToken, requireRole('owner'), [
  body('name').notEmpty().withMessage('name is required'),
  body('price').isNumeric().withMessage('price must be a number')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errorResponse('Validation error', 'VALIDATION_ERROR', 400));

    const ownerId = req.user.userId;
    const restaurantId = req.params.id;
    const product = await productService.createProduct(ownerId, restaurantId, req.body);
    res.status(201).json(successResponse(product, 'Product created'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/restaurants/{id}/products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a product for a restaurant
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
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created
 */

router.patch('/products/:id', authenticateToken, requireRole('owner'), async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const product = await productService.updateProduct(ownerId, req.params.id, req.body);
    res.status(200).json(successResponse(product, 'Product updated'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/products/{id}:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Update a product
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
 *         description: Product updated
 */

router.delete('/products/:id', authenticateToken, requireRole('owner'), async (req, res, next) => {
  try {
    const ownerId = req.user.userId;
    const result = await productService.deleteProduct(ownerId, req.params.id);
    res.status(200).json(successResponse(result, 'Product deleted'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/products/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Delete a product
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
 *         description: Product deleted
 */

router.get('/restaurants/:id/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await productService.getProductsByRestaurant(req.params.id, parseInt(page), parseInt(limit));
    res.status(200).json(successResponse(data, 'Products fetched'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/restaurants/{id}/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: List products for a restaurant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Products list
 */

module.exports = router;