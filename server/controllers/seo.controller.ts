import { Request, Response } from 'express';
import { Post } from '../models/post.model';
import { Category } from '../models/category.model';
import { generateSitemap } from '../utils/sitemap';
import { generateMetaTags } from '../utils/meta-tags';

// @desc    Generate sitemap.xml
// @route   GET /sitemap.xml
// @access  Public
export const getSitemap = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all posts and categories
    const posts = await Post.find({}).sort({ publishedAt: -1 });
    const categories = await Category.find({});
    
    // Generate sitemap XML
    const sitemap = generateSitemap(posts, categories);
    
    // Set content type to XML
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};

// @desc    Generate meta tags for a specific post or page
// @route   GET /meta-tags/:slug
// @access  Public
export const getMetaTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    // If slug is empty or 'home', generate meta tags for home page
    if (!slug || slug === 'home') {
      const metaTags = generateMetaTags({
        title: 'Finance & Crypto Blog | Latest Market News and Analysis',
        description: 'Stay up-to-date with the latest finance and cryptocurrency news, market analysis, and investment strategies.',
        url: `${req.protocol}://${req.get('host')}/`,
        imageUrl: `${req.protocol}://${req.get('host')}/og-image.jpg`,
        type: 'website'
      });
      
      res.json(metaTags);
      return;
    }
    
    // Check if slug corresponds to a post
    const post = await Post.findOne({ slug })
      .populate('authorId', '-password')
      .populate('categoryId');
    
    if (post) {
      // Generate meta tags for post
      const metaTags = generateMetaTags({
        title: post.title,
        description: post.excerpt,
        url: `${req.protocol}://${req.get('host')}/post/${post.slug}`,
        imageUrl: post.coverImage,
        type: 'article',
        publishedAt: post.publishedAt.toISOString(),
        authorName: post.authorId ? (post.authorId as any).name : 'Staff Writer',
        category: post.categoryId ? (post.categoryId as any).name : 'Finance'
      });
      
      res.json(metaTags);
      return;
    }
    
    // Check if slug corresponds to a category
    const category = await Category.findOne({ slug });
    
    if (category) {
      // Generate meta tags for category
      const metaTags = generateMetaTags({
        title: `${category.name} | Finance & Crypto Blog`,
        description: category.description,
        url: `${req.protocol}://${req.get('host')}/category/${category.slug}`,
        imageUrl: `${req.protocol}://${req.get('host')}/og-image.jpg`,
        type: 'website'
      });
      
      res.json(metaTags);
      return;
    }
    
    // If no matching post or category found, return 404
    res.status(404).json({ error: 'Page not found' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};