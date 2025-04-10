import { Request, Response } from 'express';
import { GenerationSchedule } from '../models/generation-schedule.model';
import { Topic } from '../models/topic.model';
import { Category } from '../models/category.model';
import mongoose from 'mongoose';

// @desc    Schedule content generation (new or from existing topic)
// @route   POST /api/generation/schedule
// @access  Private/Admin
export const scheduleGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    const { 
      topicId, 
      title, 
      description, 
      categoryId, 
      scheduledFor 
    } = req.body;
    
    // Validate category
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ error: 'Invalid category ID' });
      return;
    }
    
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    
    // Parse scheduledFor to ensure it's a valid date
    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format for scheduledFor' });
      return;
    }
    
    // Ensure scheduled date is in the future
    if (scheduledDate < new Date()) {
      res.status(400).json({ error: 'Scheduled date must be in the future' });
      return;
    }
    
    // If there's a topicId, fetch the topic and update its status
    if (topicId) {
      if (!mongoose.Types.ObjectId.isValid(topicId)) {
        res.status(400).json({ error: 'Invalid topic ID' });
        return;
      }
      
      const topic = await Topic.findById(topicId);
      if (!topic) {
        res.status(404).json({ error: 'Topic not found' });
        return;
      }
      
      // Update topic status to approved and set scheduledFor
      topic.status = 'approved';
      topic.scheduledFor = scheduledDate;
      await topic.save();
    }
    
    // Create generation schedule
    const generationSchedule = await GenerationSchedule.create({
      topicId: topicId || null,
      title: title || (topicId ? await Topic.findById(topicId).then(topic => topic?.title) : 'Untitled'),
      description: description || (topicId ? await Topic.findById(topicId).then(topic => topic?.description) : ''),
      categoryId,
      authorId: req.user._id,
      scheduledFor: scheduledDate,
      status: 'pending',
      generatedPostId: null,
      errorMessage: null
    });
    
    res.status(201).json({
      success: true,
      message: 'Content generation scheduled successfully',
      schedule: generationSchedule
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Get all scheduled generations
// @route   GET /api/generation/schedule
// @access  Private/Admin
export const getScheduledGenerations = async (req: Request, res: Response): Promise<void> => {
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
    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      filter.status = status;
    }
    
    // Get total count for pagination
    const total = await GenerationSchedule.countDocuments(filter);
    
    // Get scheduled generations with pagination and filter
    const schedules = await GenerationSchedule.find(filter)
      .populate('topicId')
      .populate('categoryId')
      .populate('authorId', '-password')
      .populate('generatedPostId')
      .sort({ scheduledFor: 1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      schedules,
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

// @desc    Cancel a scheduled generation
// @route   DELETE /api/generation/schedule/:id
// @access  Private/Admin
export const cancelScheduledGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid schedule ID' });
      return;
    }
    
    const schedule = await GenerationSchedule.findById(id);
    
    if (!schedule) {
      res.status(404).json({ error: 'Schedule not found' });
      return;
    }
    
    // Check if generation is pending
    if (schedule.status !== 'pending') {
      res.status(400).json({ error: 'Only pending schedules can be cancelled' });
      return;
    }
    
    // If there's a topic associated, update its status
    if (schedule.topicId) {
      const topic = await Topic.findById(schedule.topicId);
      if (topic) {
        topic.status = 'pending'; // Set back to pending
        topic.scheduledFor = null;
        await topic.save();
      }
    }
    
    // Delete the schedule
    await schedule.deleteOne();
    
    res.json({
      success: true,
      message: 'Schedule cancelled successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};