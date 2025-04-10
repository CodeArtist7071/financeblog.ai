import { Request, Response } from 'express';
import { GenerationSchedule } from '../models/generation-schedule.model';
import { Topic } from '../models/topic.model';
import { Post } from '../models/post.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';
import { initOpenAI, generateBlogPost } from '../lib/openai';
import mongoose from 'mongoose';
import { ContentPrompt } from '@shared/schema';

// Initialize OpenAI
initOpenAI();

/**
 * Verify that the request has a valid cron secret
 */
const verifySecret = (req: Request): boolean => {
  const secret = req.headers['x-cron-secret'];
  return secret === process.env.CRON_SECRET;
};

/**
 * @desc    Process scheduled content generation
 * @route   GET /api/cron/daily-generate
 * @access  Private (protected by secret header)
 */
export const dailyContentGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verify the request has the correct secret
    if (!verifySecret(req)) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    const now = new Date();
    
    // Find all pending generation schedules that are due
    const pendingSchedules = await GenerationSchedule.find({
      status: 'pending',
      scheduledFor: { $lte: now }
    }).populate('topicId').populate('categoryId').populate('authorId');

    if (pendingSchedules.length === 0) {
      res.json({ message: 'No pending schedules to process', processed: 0 });
      return;
    }

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Process each scheduled generation
    for (const schedule of pendingSchedules) {
      try {
        // If no author found, use first admin
        let authorId = schedule.authorId?._id;
        if (!authorId) {
          const adminUser = await User.findOne({ isAdmin: true });
          if (!adminUser) {
            throw new Error('No admin user found to assign as author');
          }
          authorId = adminUser._id;
        }

        // Get category - required for post
        const category = schedule.categoryId;
        if (!category) {
          throw new Error('Category not found');
        }

        // Prepare the prompt data
        // We're using the schedule title/description as the prompt
        const promptData = {
          id: mongoose.Types.ObjectId(), // Temporary ID for the function call
          title: schedule.title,
          promptTemplate: `Write a comprehensive blog post about ${schedule.title}. 
The post should cover the following aspects:
- ${schedule.description}
- Focus on {{category}} industry insights
- Include up-to-date information
- Provide actionable advice for readers`,
          categoryId: category._id,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Generate blog post
        const postData = await generateBlogPost(
          promptData,
          schedule.relatedAssets || [],
          authorId
        );

        if (!postData) {
          throw new Error('Failed to generate post content');
        }

        // Create post in database
        const post = new Post({
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          coverImage: postData.coverImage,
          publishedAt: postData.publishedAt,
          readingTime: postData.readingTime,
          authorId: authorId,
          categoryId: category._id,
          isGenerated: true,
          relatedAssets: postData.relatedAssets || [],
          tags: postData.tags || []
        });

        const savedPost = await post.save();

        // Update the schedule
        schedule.status = 'completed';
        schedule.generatedPostId = savedPost._id;
        await schedule.save();

        // Update topic status if applicable
        if (schedule.topicId) {
          const topic = await Topic.findById(schedule.topicId);
          if (topic) {
            topic.status = 'generated';
            await topic.save();
          }
        }

        successCount++;
        results.push({
          schedule: schedule._id,
          post: savedPost._id, 
          title: savedPost.title,
          status: 'success'
        });
      } catch (error) {
        // Update the schedule with error
        schedule.status = 'failed';
        schedule.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await schedule.save();

        failureCount++;
        results.push({
          schedule: schedule._id,
          error: schedule.errorMessage,
          status: 'failed'
        });
      }
    }

    res.json({
      message: `Processed ${pendingSchedules.length} schedules: ${successCount} succeeded, ${failureCount} failed`,
      processed: pendingSchedules.length,
      success: successCount,
      failure: failureCount,
      results
    });
  } catch (error) {
    console.error('Cron job error:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};