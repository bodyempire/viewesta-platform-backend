import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    const includeInactive = req.user?.userType === 'admin' && req.query.include_inactive === 'true';
    const categories = await Category.findAll(includeInactive);
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findWithMovieCount(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { slug } = req.body;
    const existing = await Category.findBySlug(slug);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Category with this slug already exists' });
    }

    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Category created successfully', data: { category } });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    if (req.body.slug && req.body.slug !== category.slug) {
      const existing = await Category.findBySlug(req.body.slug);
      if (existing) {
        return res.status(400).json({ success: false, error: 'Category with this slug already exists' });
      }
    }

    const updated = await Category.update(id, req.body);
    res.json({ success: true, message: 'Category updated successfully', data: { category: updated } });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const deleted = await Category.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

