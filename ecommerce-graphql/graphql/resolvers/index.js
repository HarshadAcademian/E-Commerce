import db from '../../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'supersecretkey123';

const resolvers = {
  Query: {
    users: async () => await db.User.findAll({ include: ['cart', 'orders'] }),
    categories: async () => await db.Category.findAll({ include: ['products'] }),
    products: async () => await db.Product.findAll({ include: ['category'] }),
    cart: async (_, __, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      return await db.Cart.findOne({
        where: { userId: context.userId },
        include: [{ model: db.CartItem, as: 'items', include: ['product'] }],
      });
    },
    orders: async (_, __, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      return await db.Order.findAll({
        where: { userId: context.userId },
        include: [{ model: db.OrderItem, as: 'items', include: ['product'] }],
      });
    },
  },

  Mutation: {
    registerUser: async (_, { name, email, password, role }) => {
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) throw new Error('User already exists');
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await db.User.create({ name, email, password: hashedPassword, role: role || 'customer' });
      await db.Cart.create({ userId: newUser.id });
      return newUser;
    },

    login: async (_, { email, password }) => {
      const user = await db.User.findOne({ where: { email } });
      if (!user) throw new Error('User not found');
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error('Invalid credentials');
      const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1d' });
      return { token, user };
    },

    addCategory: async (_, { name }) => {
      const existing = await db.Category.findOne({ where: { name } });
      if (existing) throw new Error('Category already exists');
      return await db.Category.create({ name });
    },

    addProduct: async (_, { name, description, price, stock, imageUrl, categoryId }) => {
      const category = await db.Category.findByPk(categoryId);
      if (!category) throw new Error('Category not found');
      return await db.Product.create({ name, description, price, stock, imageUrl, categoryId });
    },

    updateProductStock: async (_, { productId, quantity }) => {
      const product = await db.Product.findByPk(productId);
      if (!product) throw new Error('Product not found');

      const discountedPrice = product.price * 0.8;
      product.stock += quantity;
      product.price = parseFloat(discountedPrice.toFixed(2));

      await product.save();
      return product;
    },

    addToCart: async (_, { productId, quantity }, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      const cart = await db.Cart.findOne({ where: { userId: context.userId } });
      if (!cart) throw new Error('Cart not found');

      let item = await db.CartItem.findOne({ where: { cartId: cart.id, productId } });
      if (item) {
        item.quantity += quantity;
        await item.save();
      } else {
        item = await db.CartItem.create({ cartId: cart.id, productId, quantity });
      }

      return await db.Cart.findOne({
        where: { id: cart.id },
        include: [{ model: db.CartItem, as: 'items', include: ['product'] }],
      });
    },

    removeFromCart: async (_, { productId }, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      const cart = await db.Cart.findOne({ where: { userId: context.userId } });
      if (!cart) throw new Error('Cart not found');
      const item = await db.CartItem.findOne({ where: { cartId: cart.id, productId } });
      if (!item) throw new Error('Item not found');
      await item.destroy();
      return await db.Cart.findOne({ where: { id: cart.id }, include: [{ model: db.CartItem, as: 'items', include: ['product'] }] });
    },

    updateCartItem: async (_, { productId, quantity }, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      const cart = await db.Cart.findOne({ where: { userId: context.userId } });
      if (!cart) throw new Error('Cart not found');
      const item = await db.CartItem.findOne({ where: { cartId: cart.id, productId } });
      if (!item) throw new Error('Item not found');
      item.quantity = quantity;
      await item.save();
      return await db.Cart.findOne({ where: { id: cart.id }, include: [{ model: db.CartItem, as: 'items', include: ['product'] }] });
    },

    placeOrder: async (_, __, context) => {
      if (!context.userId) throw new Error('Unauthorized');
      const cart = await db.Cart.findOne({ where: { userId: context.userId }, include: [{ model: db.CartItem, as: 'items', include: ['product'] }] });
      if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

      for (const item of cart.items) {
        const product = item.product;
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
      }

      let total = 0;
      const order = await db.Order.create({ userId: context.userId, total: 0 });

      for (const item of cart.items) {
        const product = item.product;
        total += item.quantity * product.price;
        await db.OrderItem.create({ orderId: order.id, productId: product.id, quantity: item.quantity, price: product.price });
        product.stock -= item.quantity;
        await product.save();
      }

      order.total = total;
      await order.save();
      await db.CartItem.destroy({ where: { cartId: cart.id } });
      return await db.Order.findByPk(order.id, { include: [{ model: db.OrderItem, as: 'items', include: ['product'] }] });
    },
  },

  CartItem: {
    product: async (parent) => await db.Product.findByPk(parent.productId),
  },
  OrderItem: {
    product: async (parent) => await db.Product.findByPk(parent.productId),
  },
  Product: {
    category: async (parent) => await db.Category.findByPk(parent.categoryId),
  },
};

export default resolvers;