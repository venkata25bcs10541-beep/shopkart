const mongoose = require('mongoose');
const Product = require('../models/product.model');

/**
 * Task 2: Create a new product
 * POST /products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // Check for missing mandatory fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      price === '' ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null ||
      stock === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required',
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    // Validate price > 0
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a number greater than 0',
      });
    }

    // Validate stock >= 0
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative integer',
      });
    }

    const newProduct = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating product',
    });
  }
};

/**
 * Task 3 & Task 5 & Bonus: Get all products with search, category filtering & sorting
 * GET /products?search=...&category=...&sort=...
 */
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    // Task 5: Case-insensitive search on name
    if (search && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    // Task 5: Category filter
    if (category && category.trim() !== '' && category.trim().toLowerCase() !== 'all') {
      filter.category = { $regex: `^${category.trim()}$`, $options: 'i' };
    }

    // Bonus Challenge: Sorting by price
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    }

    const products = await Product.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching products',
    });
  }
};

/**
 * Task 4: Get single product by ID
 * GET /products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching product',
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
};
