import { Request, Response } from 'express';
import { GenerationSchedule, IGenerationScheduleDocument } from '../models/generation-schedule.model';
import { Topic } from '../models/topic.model';
import { Post } from '../models/post.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';
import { initOpenAI, generateBlogPost } from '../lib/openai';
import mongoose, { ObjectId } from 'mongoose';
import { ContentPrompt } from '@shared/schema';

// Type guard to check if a value is an ObjectId
function isObjectId(value: any): value is ObjectId {
  return value instanceof mongoose.Types.ObjectId || 
         (typeof value === 'object' && value !== null && '_id' in value);
}

// Initialize OpenAI
initOpenAI();

/**
 * Verify that the request has a valid cron secret
 * @param req - The Express request object
 * @returns true if the cron secret in the request header matches the CRON_SECRET environment variable
 * 
 * Security Note: The cron endpoint is protected by a secret key that must be provided
 * in the X-CRON-SECRET header. This prevents unauthorized access to the content generation
 * endpoint. Make sure to set the CRON_SECRET environment variable.
 */
const verifySecret = (req: Request): boolean => {
  const secret = req.headers['x-cron-secret'];
  
  if (!process.env.CRON_SECRET) {
    console.warn('CRON_SECRET environment variable is not set. Cron endpoint security is compromised!');
    return false; // Always return false if CRON_SECRET is not set to prevent unauthorized access
  }
  
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
        let authorId: mongoose.Types.ObjectId;
        if (schedule.authorId && '_id' in schedule.authorId) {
          authorId = schedule.authorId._id;
        } else {
          const adminUser = await User.findOne({ isAdmin: true });
          if (!adminUser) {
            throw new Error('No admin user found to assign as author');
          }
          authorId = adminUser._id;
        }

        // Get category - required for post
        const category = schedule.categoryId;
        if (!category || !('_id' in category)) {
          throw new Error('Category not found');
        }

        // Prepare the prompt data
        // We're using the schedule title/description as the prompt
        const promptData: ContentPrompt = {
          id: Number(new mongoose.Types.ObjectId().toString().slice(-8)), // Generate numeric id from ObjectId
          name: schedule.title,
          description: schedule.description || "",
          promptTemplate: `Write a comprehensive blog post about ${schedule.title}. 
The post should cover the following aspects:
- ${schedule.description}
- Focus on {{category}} industry insights
- Include up-to-date information
- Provide actionable advice for readers`,
          categoryId: Number(category._id),
          timesUsed: 0,
          lastUsed: null,
          createdAt: new Date()
        };

        // Determine if the schedule has relatedAssets
        const relatedAssets: string[] = [];
        
        // Only add relatedAssets if the property exists on the schedule
        if ('relatedAssets' in schedule && Array.isArray(schedule.relatedAssets)) {
          relatedAssets.push(...schedule.relatedAssets);
        }
        
        // Generate blog post - convert ObjectId to number for the OpenAI integration
        const postData = await generateBlogPost(
          promptData,
          relatedAssets,
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