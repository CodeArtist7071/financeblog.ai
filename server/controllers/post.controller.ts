import { Request, Response } from 'express';
import { Post } from '../models/post.model';
import { Comment } from '../models/comment.model';
import mongoose from 'mongoose';

// @desc    Get all posts with pagination and filtering
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categoryId = req.query.categoryId as string;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = categoryId;
    }
    
    // Get total count for pagination
    const total = await Post.countDocuments(filter);
    
    // Get posts with pagination and filter
    const posts = await Post.find(filter)
      .populate('authorId', '-password')
      .populate('categoryId')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
// @access  Public
export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const post = await Post.findOne({ slug })
      .populate('authorId', '-password')
      .populate('categoryId');
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    // Get approved comments for this post
    const comments = await Comment.find({ 
      postId: post._id,
      isApproved: true,
      parentId: null
    }).sort({ createdAt: -1 });
    
    // Get all replies for the comments
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          postId: post._id,
          parentId: comment._id,
          isApproved: true
        }).sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies
        };
      })
    );
    
    const postWithComments = {
      ...post.toObject(),
      comments: commentsWithReplies
    };
    
    res.json(postWithComments);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Get posts by category with pagination
// @route   GET /api/categories/:categoryId/posts
// @access  Public
export const getPostsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }
    
    // Get total count for pagination
    const total = await Post.countDocuments({ categoryId });
    
    // Get posts with pagination
    const posts = await Post.find({ categoryId })
      .populate('authorId', '-password')
      .populate('categoryId')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private/Admin
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }
    
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      categoryId,
      tags,
      readingTime,
      isGenerated,
      relatedAssets
    } = req.body;
    
    // Check if post with the same slug exists
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      res.status(400).json({ error: 'A post with this slug already exists' });
      return;
    }
    
    // Create the post
    const post = await Post.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      categoryId,
      authorId: req.user._id,
      tags: tags || [],
      readingTime: readingTime || 5,
      isGenerated: isGenerated || false,
      relatedAssets: relatedAssets || [],
      publishedAt: new Date()
    });
    
    // Fetch the post with populated fields
    const createdPost = await Post.findById(post._id)
      .populate('authorId', '-password')
      .populate('categoryId');
    
    res.status(201).json(createdPost);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private/Admin
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }
    
    const post = await Post.findById(id);
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    // Update fields
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      categoryId,
      tags,
      readingTime,
      isGenerated,
      relatedAssets
    } = req.body;
    
    // If slug is being changed, check if it's unique
    if (slug && slug !== post.slug) {
      const existingPost = await Post.findOne({ slug });
      if (existingPost && !existingPost._id.equals(post._id)) {
        res.status(400).json({ error: 'A post with this slug already exists' });
        return;
      }
    }
    
    // Update the post
    post.title = title || post.title;
    post.slug = slug || post.slug;
    post.excerpt = excerpt || post.excerpt;
    post.content = content || post.content;
    post.coverImage = coverImage || post.coverImage;
    post.categoryId = categoryId || post.categoryId;
    post.tags = tags || post.tags;
    post.readingTime = readingTime || post.readingTime;
    post.isGenerated = isGenerated !== undefined ? isGenerated : post.isGenerated;
    post.relatedAssets = relatedAssets || post.relatedAssets;
    
    const updatedPost = await post.save();
    
    // Fetch the updated post with populated fields
    const populatedPost = await Post.findById(updatedPost._id)
      .populate('authorId', '-password')
      .populate('categoryId');
    
    res.json(populatedPost);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private/Admin
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid post ID' });
      return;
    }
    
    const post = await Post.findById(id);
    
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    // Delete all comments associated with this post
    await Comment.deleteMany({ postId: post._id });
    
    // Delete the post
    await post.deleteOne();
    
    res.json({ message: 'Post and associated comments removed' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};