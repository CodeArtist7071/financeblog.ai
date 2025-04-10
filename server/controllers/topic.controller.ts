import { Request, Response } from 'express';
import { Topic } from '../models/topic.model';
import { Category } from '../models/category.model';
import mongoose from 'mongoose';

// @desc    Submit a new topic
// @route   POST /api/topics/submit
// @access  Public
export const submitTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, categoryId, email } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    // Create the topic
    const topic = await Topic.create({
      title,
      description,
      categoryId,
      // If user is logged in, associate topic with user
      userId: req.user ? req.user._id : null,
      // Email is required for guest submissions, optional for logged-in users
      email: req.user ? req.user.email : email,
      status: 'pending',
      scheduledFor: null
    });
    
    res.status(201).json({
      success: true,
      message: 'Topic submitted successfully',
      topic
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Get all topics (admin only)
// @route   GET /api/topics
// @access  Private/Admin
export const getTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string || '';
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    if (status && ['pending', 'approved', 'rejected', 'generated'].includes(status)) {
      filter.status = status;
    }
    
    // Get total count for pagination
    const total = await Topic.countDocuments(filter);
    
    // Get topics with pagination and filter
    const topics = await Topic.find(filter)
      .populate('categoryId')
      .populate('userId', '-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      topics,
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

// @desc    Schedule a topic for generation
// @route   POST /api/topics/:id/schedule
// @access  Private/Admin
export const scheduleTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    const { id } = req.params;
    const { scheduledFor } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid topic ID' });
      return;
    }
    
    const topic = await Topic.findById(id);
    
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    
    // Update topic with scheduled date
    topic.status = 'approved';
    topic.scheduledFor = new Date(scheduledFor);
    
    const updatedTopic = await topic.save();
    
    res.json({
      success: true,
      message: 'Topic scheduled for generation',
      topic: updatedTopic
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Update topic status
// @route   PATCH /api/topics/:id/status
// @access  Private/Admin
export const updateTopicStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid topic ID' });
      return;
    }
    
    if (!['pending', 'approved', 'rejected', 'generated'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }
    
    const topic = await Topic.findById(id);
    
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    
    // Update topic status
    topic.status = status;
    
    const updatedTopic = await topic.save();
    
    res.json({
      success: true,
      message: 'Topic status updated',
      topic: updatedTopic
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Delete a topic
// @route   DELETE /api/topics/:id
// @access  Private/Admin
export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid topic ID' });
      return;
    }
    
    const topic = await Topic.findById(id);
    
    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }
    
    await topic.deleteOne();
    
    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};