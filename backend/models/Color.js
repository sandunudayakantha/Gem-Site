import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Color = sequelize.define('Color', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    trim: true,
    set(val) {
      if (val) this.setDataValue('name', val.toLowerCase());
    }
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  hexCode: {
    type: DataTypes.STRING,
    trim: true,
    defaultValue: '#000000'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

export default Color;
