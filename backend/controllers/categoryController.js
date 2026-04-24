import { Op } from 'sequelize';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { processUpload } from '../utils/imageProcessor.js';

// Get all categories with subcategories
export const getCategories = async (req, res) => {
  try {
    const { includeSubcategories } = req.query;
    
    if (includeSubcategories === 'true') {
      // Return all categories (main + subcategories) for admin management
      const categories = await Category.findAll({
        include: [
          { model: Category, as: 'subcategories' },
          { model: Category, as: 'parent', attributes: ['name'] }
        ],
        order: [['parentId', 'ASC'], ['name', 'ASC']]
      });
      res.json(categories);
    } else {
      // Return only main categories with populated subcategories (for frontend)
      const categories = await Category.findAll({
        where: { parentId: null },
        include: [{ model: Category, as: 'subcategories' }],
        order: [['name', 'ASC']]
      });
      res.json(categories);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single category
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'subcategories' },
        { model: Category, as: 'parent' }
      ]
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, parent, image } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    
    // Normalize parent: convert empty string to null, keep valid IDs as-is
    const normalizedParentId = parent && parent.trim() !== '' ? parseInt(parent) : null;
    
    // Check if category with same slug exists under the same parent
    const existingCategory = await Category.findOne({ 
      where: {
        slug, 
        parentId: normalizedParentId 
      }
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: normalizedParentId 
          ? 'Subcategory with this name already exists under this parent' 
          : 'Category with this name already exists' 
      });
    }

    const categoryData = {
      name,
      slug,
      parentId: normalizedParentId,
      image: req.file ? await processUpload(req.file) : image || null
    };

    if (normalizedParentId) {
      const parentCategory = await Category.findByPk(normalizedParentId);
      if (!parentCategory) {
        return res.status(404).json({ message: 'Parent category not found' });
      }
    }

    const category = await Category.create(categoryData);
    
    const freshCategory = await Category.findByPk(category.id, {
      include: [{ model: Category, as: 'parent', attributes: ['name'] }]
    });

    res.status(201).json(freshCategory);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const parentId = req.body.parent && req.body.parent.trim() !== '' ? parseInt(req.body.parent) : null;
      return res.status(400).json({ 
        message: parentId 
          ? 'Subcategory with this name already exists under this parent' 
          : 'Category with this name already exists' 
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = { ...req.body };
    const newParentId = req.body.parent !== undefined ? (req.body.parent && req.body.parent.trim() !== '' ? parseInt(req.body.parent) : null) : category.parentId;

    if (req.body.name && req.body.name !== category.name) {
      const newSlug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
      
      // Check if slug already exists under the new parent (or same parent if not changing)
      const existingCategory = await Category.findOne({ 
        where: {
          slug: newSlug, 
          parentId: newParentId,
          id: { [Op.ne]: category.id }
        }
      });
      
      if (existingCategory) {
        return res.status(400).json({ 
          message: newParentId 
            ? 'Subcategory with this name already exists under this parent' 
            : 'Category with this name already exists' 
        });
      }
      
      updateData.slug = newSlug;
    }

    if (req.file) {
      updateData.image = await processUpload(req.file);
    }

    if (req.body.parent !== undefined) {
      updateData.parentId = newParentId;
    }

    await category.update(updateData);
    
    const freshCategory = await Category.findByPk(category.id, {
      include: [
        { model: Category, as: 'subcategories' },
        { model: Category, as: 'parent' }
      ]
    });

    res.json(freshCategory);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Category with this name already exists under this parent' 
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productsCount = await Product.count({ where: { categoryId: category.id } });
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${productsCount} product(s) are using this category.` 
      });
    }

    // Delete subcategories first (or handle via CASCADE in DB if desired, but here we do it explicitly)
    await Category.destroy({ where: { parentId: category.id } });

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
