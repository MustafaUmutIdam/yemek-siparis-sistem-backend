/**
 * Product Service
 * Owner creates/updates/deletes products for their restaurant
 */
const { Product, Restaurant } = require('../models');

const createProduct = async (ownerId, restaurantId, data) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  if (restaurant.ownerId.toString() !== ownerId.toString()) throw new Error('Bu işlem için yetkiniz yok');

  const product = new Product({ ...data, restaurantId });
  await product.save();
  return product;
};

const updateProduct = async (ownerId, productId, updateData) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product bulunamadı');

  const restaurant = await Restaurant.findById(product.restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  if (restaurant.ownerId.toString() !== ownerId.toString()) throw new Error('Bu işlem için yetkiniz yok');

  Object.assign(product, updateData);
  await product.save();
  return product;
};

const deleteProduct = async (ownerId, productId) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product bulunamadı');

  const restaurant = await Restaurant.findById(product.restaurantId);
  if (!restaurant) throw new Error('Restaurant bulunamadı');
  if (restaurant.ownerId.toString() !== ownerId.toString()) throw new Error('Bu işlem için yetkiniz yok');

  // Use deleteOne on the document (remove() may not exist on newer mongoose versions)
  await product.deleteOne();
  return { message: 'Product silindi' };
};

const getProductsByRestaurant = async (restaurantId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const products = await Product.find({ restaurantId })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Product.countDocuments({ restaurantId });
  return { products, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
};

module.exports = { createProduct, updateProduct, deleteProduct, getProductsByRestaurant };
