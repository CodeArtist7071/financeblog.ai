import { Request, Response } from "express";
import { storage } from "../storage";

/**
 * @desc    Get analytics data
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get time range from query params (default to 'week')
    const timeRange = req.query.timeRange as string || 'week';
    
    // Get all posts, comments, and users
    const posts = await storage.getPosts();
    const allComments = [];
    const users = await storage.getUsers();
    const categories = await storage.getCategories();

    // Extract post data for each post with comments
    for (const post of posts) {
      const comments = await storage.getCommentsBySlug(post.slug);
      allComments.push(...comments);
    }

    // Get current date and calculate start date based on time range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7); // Default to week
    }

    // Filter posts and comments by date range
    const postsInRange = posts.filter(post => new Date(post.publishedAt) >= startDate);
    const commentsInRange = allComments.filter(comment => new Date(comment.createdAt) >= startDate);

    // Calculate previous period for growth comparison
    const previousStartDate = new Date(startDate);
    let previousEndDate = new Date(startDate);
    
    switch (timeRange) {
      case 'day':
        previousStartDate.setDate(previousStartDate.getDate() - 1);
        break;
      case 'week':
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case 'month':
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        break;
      case 'year':
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        break;
    }

    // Generate date labels for charts based on time range
    const dateLabels = generateDateLabels(startDate, now, timeRange);

    // Initialize view counts for each date
    const viewsByDay = dateLabels.map(date => ({
      date,
      views: Math.floor(Math.random() * 100) + 50, // Simulate view data
    }));

    // Generate comment counts by day
    const commentsByDay = dateLabels.map(date => ({
      date,
      count: Math.floor(Math.random() * 10) + 5, // Simulate comment data
    }));

    // Count posts by category
    const categoryCounts = categories.map(category => {
      const count = posts.filter(post => post.categoryId === category.id).length;
      return {
        name: category.name,
        count,
      };
    });

    // Simulate top posts by views
    const topPosts = posts
      .slice(0, 5)
      .map(post => ({
        title: post.title.length > 25 ? post.title.substring(0, 25) + '...' : post.title,
        views: Math.floor(Math.random() * 1000) + 200, // Simulate view counts
      }));

    // Calculate growth rates
    const viewsGrowth = generateGrowthRate();
    const postsGrowth = Math.floor((postsInRange.length / Math.max(posts.length, 1)) * 100);
    const commentsGrowth = generateGrowthRate();

    // Compile response data
    const analyticsData = {
      viewsByDay,
      categoryCounts,
      topPosts,
      commentsByDay,
      totalViews: viewsByDay.reduce((sum, item) => sum + item.views, 0),
      totalPosts: posts.length,
      totalComments: allComments.length,
      totalUsers: users.length,
      weeklyGrowth: {
        views: viewsGrowth,
        posts: postsGrowth,
        comments: commentsGrowth,
      },
    };

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

// Helper function to generate date labels
function generateDateLabels(startDate: Date, endDate: Date, timeRange: string): string[] {
  const labels = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    let label = '';
    
    switch (timeRange) {
      case 'day':
        label = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        currentDate.setHours(currentDate.getHours() + 1);
        break;
      case 'week':
        label = currentDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'month':
        label = currentDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        currentDate.setDate(currentDate.getDate() + 2); // Every other day for month view
        break;
      case 'year':
        label = currentDate.toLocaleDateString([], { month: 'short' });
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        label = currentDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    labels.push(label);
    
    // Avoid infinite loops
    if (labels.length > 100) break;
  }
  
  return labels;
}

// Helper function to generate random growth rates
function generateGrowthRate(): number {
  return Math.floor(Math.random() * 30) - 10; // Range from -10% to +20%
}