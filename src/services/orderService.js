/**
 * Order Service
 * Basic order lifecycle: create, owner confirm, owner assign courier, courier update status
 */
const { Order, Product, Restaurant, Courier, Consumer } = require('../models');
const mongoose = require('mongoose');

const createOrder = async (consumerId, restaurantId, items, deliveryLocation, paymentMethod = 'cash') => {
  // items: [{ productId, quantity }]
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');

  // Calculate total
  let totalPrice = 0;
  const detailedItems = [];
  for (const it of items) {
    const product = await Product.findById(it.productId);
    if (!product) throw new Error(`Product bulunamadı: ${it.productId}`);
    if (!product.isAvailable) throw new Error(`Product şu anda mevcut değil: ${product.name}`);

    const subtotal = product.price * (it.quantity || 1);
    totalPrice += subtotal;
    detailedItems.push({ productId: product._id, productName: product.name, price: product.price, quantity: it.quantity || 1 });
  }

  const deliveryFee = restaurant.deliveryFee || 0;
  const finalPrice = totalPrice + deliveryFee;

  const order = new Order({
    restaurantId,
    consumerId,
    items: detailedItems,
    totalPrice,
    deliveryFee,
    finalPrice,
    paymentMethod,
    deliveryLocation,
    status: 'pending',
    statusHistory: [{ status: 'pending', changedBy: 'consumer', timestamp: new Date(), note: 'Order created' }]
  });

  await order.save();
  return order;
};

const getOrderByIdForUser = async (userId, role, orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) throw new Error('Invalid order id');
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order bulunamadı');

  // Authorization
  if (role === 'consumer' && order.consumerId.toString() !== userId.toString()) throw new Error('Yetki yok');
  if (role === 'owner') {
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (!restaurant || restaurant.ownerId.toString() !== userId.toString()) throw new Error('Yetki yok');
  }
  if (role === 'courier' && order.courierId?.toString() !== userId.toString()) throw new Error('Yetki yok');

  return order;
};

const ownerConfirmOrder = async (ownerId, orderId, accept = true) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order bulunamadı');

  const restaurant = await Restaurant.findById(order.restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  if (restaurant.ownerId.toString() !== ownerId.toString()) throw new Error('Yetki yok');

  order.status = accept ? 'confirmed' : 'cancelled';
  order.statusHistory.push({ status: order.status, changedBy: 'owner', timestamp: new Date(), note: accept ? 'Order accepted' : 'Order cancelled' });
  await order.save();
  return order;
};

const ownerAssignCourier = async (ownerId, orderId, courierId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order bulunamadı');

  const restaurant = await Restaurant.findById(order.restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  if (restaurant.ownerId.toString() !== ownerId.toString()) throw new Error('Yetki yok');

  const courier = await Courier.findById(courierId);
  if (!courier) throw new Error('Courier bulunamadı');

  order.courierId = courier._id;
  order.status = 'on_way';
  order.statusHistory.push({ status: 'on_way', changedBy: 'owner', timestamp: new Date(), note: `Assigned to courier ${courier._id}` });
  await order.save();
  return order;
};

const courierUpdateStatus = async (courierId, orderId, newStatus) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order bulunamadı');
  if (order.courierId?.toString() !== courierId.toString()) throw new Error('Yetki yok');

  const valid = ['on_way', 'delivered'];
  if (!valid.includes(newStatus)) throw new Error('Invalid status');

  order.status = newStatus;
  order.statusHistory.push({ status: newStatus, changedBy: 'courier', timestamp: new Date(), note: `Courier updated to ${newStatus}` });
  if (newStatus === 'delivered') order.deliveredAt = new Date();
  await order.save();
  return order;
};

module.exports = { createOrder, getOrderByIdForUser, ownerConfirmOrder, ownerAssignCourier, courierUpdateStatus };
