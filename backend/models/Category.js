import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
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
  toObject: { virtuals: true },
  indexes: [
    {
      unique: true,
      fields: ['slug', 'parentId']
    }
  ]
});

export default Category;
