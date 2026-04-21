import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { items, customer, deliveryFee } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address) {
      return res.status(400).json({ message: 'Customer information is incomplete' });
    }

    // Calculate total and validate products
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }


      const price = parseFloat(product.discountPrice || product.price);
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product.id,
        title: product.title,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: price,
        // Gemstone specific fields for full detail in admin
        weight: product.weight,
        dimensions: product.dimensions,
        cut: product.cut,
        gemColor: product.gemColor,
        clarity: product.clarity,
        treatment: product.treatment,
        origin: product.origin,
        certification: product.certification,
        priceUnit: product.priceUnit,
        images: product.images
      });
    }

    const deliveryFeeAmount = deliveryFee ? parseFloat(deliveryFee) : 0;
    const totalAmount = subtotal + deliveryFeeAmount;

    const order = await Order.create({
      items: orderItems,
      customer,
      totalAmount,
      deliveryFee: deliveryFeeAmount,
      paymentMethod: 'Cash on Delivery'
    });

    res.status(201).json(order);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Order number already exists. Please try again.' });
    }
    res.status(400).json({ message: error.message || 'Failed to create order. Please try again.' });
  }
};

// Get all orders (Admin only)
export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order (Admin only)
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Dispatched', 'Delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ status });

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order statistics (Admin only)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'Pending' } });
    const processingOrders = await Order.count({ where: { status: 'Processing' } });
    const dispatchedOrders = await Order.count({ where: { status: 'Dispatched' } });
    const deliveredOrders = await Order.count({ where: { status: 'Delivered' } });

    const totalRevenue = await Order.sum('totalAmount', { where: { status: 'Delivered' } });

    res.json({
      totalOrders,
      pendingOrders,
      processingOrders,
      dispatchedOrders,
      deliveredOrders,
      totalRevenue: totalRevenue || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
