import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true // Generated before save
  },
  items: {
    type: DataTypes.JSON, // Array of order items
    allowNull: false
  },
  customer: {
    type: DataTypes.JSON, // Object with name, phone, email, address
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'Cash on Delivery'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Processing', 'Dispatched', 'Delivered'),
    defaultValue: 'Pending'
  }
}, {
  timestamps: true,
  hooks: {
    beforeValidate: (order) => {
      if (!order.orderNumber || order.orderNumber.trim() === '') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 100000);
        const processId = process.pid || 0;
        order.orderNumber = `ORD-${timestamp}-${random}-${processId}`;
      }
    }
  }
});

export default Order;
