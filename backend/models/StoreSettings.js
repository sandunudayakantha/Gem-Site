import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StoreSettings = sequelize.define('StoreSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contact: {
    type: DataTypes.JSON,
    defaultValue: {
      phone: '',
      callPhone: '',
      email: '',
      address: '',
      whatsapp: ''
    }
  },
  banner: {
    type: DataTypes.JSON,
    defaultValue: {
      images: [],
      image: null,
      title: '',
      description: ''
    }
  },
  specialOffer: {
    type: DataTypes.JSON,
    defaultValue: {
      enabled: false,
      percentage: 0,
      title: ''
    }
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  timestamps: true
});

// Static method to get or create settings
StoreSettings.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default StoreSettings;
