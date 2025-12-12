/**
 * Courier Service
 * Owner can create, update, delete couriers for their restaurants
 */
const { Courier, Restaurant } = require('../models');

const createCourier = async (ownerId, restaurantId, data) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  if (restaurant.ownerId.toString() !== ownerId.toString()) throw new Error('Bu işlem için yetkiniz yok');

  const courier = new Courier({ ...data, restaurantId });
  await courier.save();
  return courier;
};

const updateCourier = async (ownerId, courierId, updateData) => {
  const courier = await Courier.findById(courierId);
  if (!courier) throw new Error('Courier bulunamadı');

  const restaurant = await Restaurant.findById(courier.restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  if (restaurant.ownerId.toString() !== ownerId.toString()) throw new Error('Bu işlem için yetkiniz yok');

  Object.assign(courier, updateData);
  await courier.save();
  return courier;
};

const deleteCourier = async (ownerId, courierId) => {
  const courier = await Courier.findById(courierId);
  if (!courier) throw new Error('Courier bulunamadı');

  const restaurant = await Restaurant.findById(courier.restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  if (restaurant.ownerId.toString() !== ownerId.toString()) throw new Error('Bu işlem için yetkiniz yok');

  await courier.remove();
  return { message: 'Courier silindi' };
};

const getCouriersByRestaurant = async (restaurantId) => {
  const couriers = await Courier.find({ restaurantId }).sort({ createdAt: -1 });
  return couriers;
};

module.exports = { createCourier, updateCourier, deleteCourier, getCouriersByRestaurant };
