import { Op } from 'sequelize';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import StoreSettings from '../models/StoreSettings.js';
import { processUpload } from '../utils/imageProcessor.js';

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { category, featured, newArrival, search } = req.query;
    const where = {};
    const andConditions = [];

    // Handle category filtering
    if (category && category !== 'null' && category !== 'undefined') {
      const categoryId = parseInt(category);
      if (isNaN(categoryId)) {
        where.categoryId = -1; // Invalid ID
      } else {
        const categoryDoc = await Category.findByPk(categoryId, {
          include: [{ model: Category, as: 'subcategories' }]
        });
        
        if (categoryDoc) {
          if (categoryDoc.parentId) {
            // It's a subcategory
            andConditions.push({
              [Op.or]: [
                { categoryId: categoryId },
                {
                  categoryId: categoryDoc.parentId,
                  subcategory: { [Op.like]: `%${categoryDoc.name}%` }
                }
              ]
            });
          } else {
            // It's a main category
            const subcategoryIds = categoryDoc.subcategories.map(s => s.id);
            andConditions.push({
              [Op.or]: [
                { categoryId: categoryId },
                { categoryId: { [Op.in]: subcategoryIds } }
              ]
            });
          }
        } else {
          where.categoryId = -1;
        }
      }
    }
    
    // Handle featured filter
    if (featured === 'true') {
      where.featured = true;
    }
    
    // Handle new arrival filter
    if (newArrival === 'true') {
      where.newArrival = true;
    }
    
    // Handle search filter
    if (search) {
      andConditions.push({
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ]
      });
    }

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 12;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    const totalPages = Math.ceil(count / limit);

    // Apply special offer if enabled
    const settings = await StoreSettings.getSettings();
    const result = products.map(p => {
      const product = p.toJSON();
      if (settings.specialOffer.enabled && settings.specialOffer.percentage > 0) {
        if (!product.discountPrice) {
          product.discountPrice = product.price * (1 - settings.specialOffer.percentage / 100);
        }
      }
      return product;
    });

    res.json({
      products: result,
      currentPage: page,
      totalPages,
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const productDoc = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
      ]
    });

    if (!productDoc) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productDoc.toJSON();

    // Apply special offer if enabled
    const settings = await StoreSettings.getSettings();
    if (settings.specialOffer.enabled && settings.specialOffer.percentage > 0) {
      if (!product.discountPrice) {
        product.discountPrice = product.price * (1 - settings.specialOffer.percentage / 100);
      }
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const optimizedPath = await processUpload(file);
        images.push(optimizedPath);
      }
    }
    
    if (images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const productData = {
      ...req.body,
      images: images,
      categoryId: parseInt(req.body.category),
      price: (req.body.price && req.body.price !== '') ? parseFloat(req.body.price) : null,
      discountPrice: (req.body.discountPrice && req.body.discountPrice !== '') ? parseFloat(req.body.discountPrice) : null,
      featured: req.body.featured === 'true' || req.body.featured === true,
      newArrival: req.body.newArrival === 'true' || req.body.newArrival === true,
      sizes: Array.isArray(req.body.sizes) ? req.body.sizes : req.body.sizes?.split(',').map(s => s.trim()) || [],
      colors: Array.isArray(req.body.colors) ? req.body.colors : req.body.colors?.split(',').map(c => c.trim()) || [],
      stock: (req.body.stock !== undefined && req.body.stock !== '') ? parseInt(req.body.stock) : null,
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      dimensions: req.body.dimensions || null,
      cut: req.body.cut || null,
      gemColor: req.body.gemColor || null,
      clarity: req.body.clarity || null,
      treatment: req.body.treatment || null,
      origin: req.body.origin || null,
      certification: req.body.certification || null,
      priceUnit: req.body.priceUnit || 'total'
    };

    const product = await Product.create(productData);
    
    const freshProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }]
    });
    
    res.status(201).json(freshProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    const productDoc = await Product.findByPk(req.params.id);
    
    if (!productDoc) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const optimizedPath = await processUpload(file);
        newImages.push(optimizedPath);
      }
      updateData.images = [...(productDoc.images || []), ...newImages];
    }

    if (updateData.category) updateData.categoryId = parseInt(updateData.category);
    if (updateData.price !== undefined) {
      updateData.price = (updateData.price && updateData.price !== '') ? parseFloat(updateData.price) : null;
    }
    if (updateData.discountPrice !== undefined) {
      updateData.discountPrice = (updateData.discountPrice && updateData.discountPrice !== '') ? parseFloat(updateData.discountPrice) : null;
    }
    if (updateData.featured !== undefined) updateData.featured = updateData.featured === 'true' || updateData.featured === true;
    if (updateData.newArrival !== undefined) updateData.newArrival = updateData.newArrival === 'true' || updateData.newArrival === true;
    if (updateData.sizes) {
      updateData.sizes = Array.isArray(updateData.sizes) ? updateData.sizes : updateData.sizes.split(',').map(s => s.trim());
    }
    if (updateData.colors) {
      updateData.colors = Array.isArray(updateData.colors) ? updateData.colors : updateData.colors.split(',').map(c => c.trim());
    }
    if (updateData.stock !== undefined) {
      updateData.stock = (updateData.stock !== undefined && updateData.stock !== '') ? parseInt(updateData.stock) : null;
    }
    if (updateData.weight !== undefined) updateData.weight = updateData.weight ? parseFloat(updateData.weight) : null;
    
    // String fields will be taken from updateData (...req.body) directly 
    // but ensured they are null if empty string
    const stringFields = ['dimensions', 'cut', 'gemColor', 'clarity', 'treatment', 'origin', 'certification', 'priceUnit'];
    stringFields.forEach(field => {
      if (updateData[field] === '') updateData[field] = null;
    });

    await productDoc.update(updateData);
    
    const freshProduct = await Product.findByPk(productDoc.id, {
      include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }]
    });

    res.json(freshProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
