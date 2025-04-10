import { Request, Response } from 'express';
import { Category } from '../models/category.model';
import mongoose from 'mongoose';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug });
    
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    res.json(category);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }
    
    const { name, slug, description, icon } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }]
    });
    
    if (existingCategory) {
      res.status(400).json({ 
        error: existingCategory.name === name 
          ? 'A category with this name already exists' 
          : 'A category with this slug already exists' 
      });
      return;
    }
    
    // Create the category
    const category = await Category.create({
      name,
      slug,
      description,
      icon: icon || 'category'
    });
    
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    const { name, slug, description, icon } = req.body;
    
    // If name or slug is being changed, check if it's unique
    if ((name && name !== category.name) || (slug && slug !== category.slug)) {
      const existingCategory = await Category.findOne({
        _id: { $ne: category._id },
        $or: [
          { name: name || category.name },
          { slug: slug || category.slug }
        ]
      });
      
      if (existingCategory) {
        const isDuplicateName = existingCategory.name === (name || category.name);
        
        res.status(400).json({ 
          error: isDuplicateName 
            ? 'A category with this name already exists' 
            : 'A category with this slug already exists' 
        });
        return;
      }
    }
    
    // Update the category
    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.description = description || category.description;
    category.icon = icon || category.icon;
    
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    // Check if there are posts using this category
    const Post = mongoose.model('Post');
    const postCount = await Post.countDocuments({ categoryId: category._id });
    
    if (postCount > 0) {
      res.status(400).json({ 
        error: `Cannot delete category. It is being used by ${postCount} posts.`
      });
      return;
    }
    
    // Delete the category
    await category.deleteOne();
    
    res.json({ message: 'Category removed' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};