/**
 * Owner Service
 * Restoran CRUD işlemleri (owner scope)
 */

const { Restaurant, Product, Courier } = require('../models');

const createRestaurant = async (ownerId, data) => {
  const restaurant = new Restaurant({ ...data, ownerId });
  await restaurant.save();
  return restaurant.toObject();
};

const getRestaurantsByOwner = async (ownerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const restaurants = await Restaurant.find({ ownerId })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Restaurant.countDocuments({ ownerId });
  return { restaurants, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
};

const getRestaurantById = async (ownerId, restaurantId) => {
  const restaurant = await Restaurant.findOne({ _id: restaurantId, ownerId });
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  return restaurant;
};

const updateRestaurant = async (ownerId, restaurantId, updateData) => {
  const restaurant = await Restaurant.findOneAndUpdate({ _id: restaurantId, ownerId }, updateData, { new: true });
  if (!restaurant) throw new Error('Restaurant bulunamadı veya yetkiniz yok');
  return restaurant;
};

const deleteRestaurant = async (ownerId, restaurantId) => {
  const restaurant = await Restaurant.findOneAndDelete({ _id: restaurantId, ownerId });
  if (!restaurant) throw new Error('Restaurant bulunamadı veya yetkiniz yok');
  // Optionally cascade delete products and couriers for this restaurant
  await Product.deleteMany({ restaurantId: restaurant._id });
  await Courier.updateMany({ restaurantId: restaurant._id }, { $unset: { restaurantId: '' } });
  return { message: 'Restaurant silindi' };
};

module.exports = {
  createRestaurant,
  getRestaurantsByOwner,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};