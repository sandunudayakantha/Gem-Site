import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Cut = sequelize.define('Cut', {
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
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default Cut;
