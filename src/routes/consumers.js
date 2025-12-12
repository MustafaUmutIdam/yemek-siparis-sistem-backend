/**
 * Consumer Routes
 */
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticateToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/roles');
const { Consumer, Restaurant } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

/**
 * @swagger
 * /api/v1/consumers/profile:
 *   get:
 *     tags:
 *       - Consumers
 *     summary: Get consumer profile
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticateToken, requireRole('consumer'), async (req, res, next) => {
  try {
    const consumer = await Consumer.findById(req.user.userId).select('-password');
    res.status(200).json(successResponse(consumer, 'Profile fetched'));
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', authenticateToken, requireRole('consumer'), async (req, res, next) => {
  try {
    const consumer = await Consumer.findById(req.user.userId);
    if (!consumer) throw new Error('Consumer bulunamadı');

    Object.assign(consumer, req.body);
    await consumer.save();
    res.status(200).json(successResponse(consumer, 'Profile updated'));
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/consumers/profile:
 *   patch:
 *     tags:
 *       - Consumers
 *     summary: Update consumer profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * Search restaurants by proximity or query
 * /api/v1/consumers/search?lat=..&lon=..&maxDistance=5000
 */
router.get('/search', [
  query('lat').optional().isFloat(),
  query('lon').optional().isFloat()
], async (req, res, next) => {
  try {
    const { lat, lon, maxDistance = 5000, q } = req.query;

    if (lat && lon) {
      const restaurants = await Restaurant.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
            $maxDistance: parseInt(maxDistance)
          }
        }
      }).limit(50);

      return res.status(200).json(successResponse(restaurants, 'Nearby restaurants fetched'));
    }

    if (q) {
      const restaurants = await Restaurant.find({ $text: { $search: q } }).limit(50);
      return res.status(200).json(successResponse(restaurants, 'Restaurants fetched by query'));
    }

    const all = await Restaurant.find().limit(50);
    res.status(200).json(successResponse(all, 'Restaurants fetched'));
  } catch (error) {
    next(error);
  }
});

  /**
   * @swagger
   * /api/v1/consumers/search:
   *   get:
   *     tags:
   *       - Consumers
   *     summary: Search restaurants by location or query
   *     parameters:
   *       - in: query
   *         name: lat
   *         schema:
   *           type: number
   *       - in: query
   *         name: lon
   *         schema:
   *           type: number
   *       - in: query
   *         name: maxDistance
   *         schema:
   *           type: integer
   *           default: 5000
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Restaurants search results
   */

module.exports = router;