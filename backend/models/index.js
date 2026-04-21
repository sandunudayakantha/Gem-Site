import sequelize from '../config/database.js';
import AdminUser from './AdminUser.js';
import Category from './Category.js';
import Color from './Color.js';
import Cut from './Cut.js';
import Clarity from './Clarity.js';
import Certification from './Certification.js';
import ContactMessage from './ContactMessage.js';
import Order from './Order.js';
import GemColor from './GemColor.js';
import Origin from './Origin.js';
import Product from './Product.js';
import Size from './Size.js';
import StoreSettings from './StoreSettings.js';

// Define Associations

// Category has subcategories (self-referencing)
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

// Product belongs to a Category
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

// Product subcategory name? (Original code used a string field for subcategory name)

// Size and Color associations with Category (Optional, original code had a Category ref)
Size.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Color.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

const db = {
  sequelize,
  AdminUser,
  Category,
  Color,
  Cut,
  Clarity,
  Certification,
  GemColor,
  Origin,
  ContactMessage,
  Order,
  Product,
  Size,
  StoreSettings
};

export default db;
