import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { comparePassword, generateToken, hashPassword } from "./lib/auth";
import { authenticate, requireAdmin } from "./middleware/auth";
import { getAnalytics } from "./controllers/analytics.controller";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add a route to check if the OpenAI API key is configured
  app.get('/api/check-openai-key', (req: Request, res: Response) => {
    const apiKey = process.env.OPENAI_API_KEY;
    res.json({ configured: !!apiKey });
  });
  // Authentication routes
  // Validation schemas
  const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  });

  const registerSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  });

  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = loginSchema.parse(req.body);
      
      // The issue is here - we're using getUserByUsername with an email value
      // Find user by email - use proper lookup method
      // Since we're using email for login, we need to ensure we're querying correctly
      console.log("Looking up user with email:", validatedData.email);
      const users = await storage.getUsers();
      const user = users.find(u => u.email === validatedData.email);
      
      if (!user) {
        console.log("User not found with email:", validatedData.email);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check password
      const passwordValid = await comparePassword(validatedData.password, user.password);
      
      if (!passwordValid) {
        console.log("Password invalid for user:", user.username);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Set cookie with the token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "strict"
      });
      
      // Return user info (without password)
      const { password, ...userWithoutPassword } = user;
      res.status(200).json({ 
        user: userWithoutPassword,
        token, // Also send token in response body for clients that don't use cookies
        success: true
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Regular user registration
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.email);
      
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create new user
      const newUser = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        isAdmin: false // Regular users are not admins by default
      });
      
      // Generate token for the new user
      const token = generateToken(newUser);
      
      // Set cookie with the token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "strict"
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        user: userWithoutPassword,
        token,
        success: true
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Register new admin (requires admin privileges)
  app.post("/api/auth/register-admin", authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.email);
      
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create new admin user
      const newUser = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        isAdmin: true // All registered users through this route are admins
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        user: userWithoutPassword,
        success: true
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error("Admin registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Get current user route
  app.get("/api/auth/me", authenticate, (req: Request, res: Response) => {
    res.status(200).json({ user: req.user });
  });

  // Initial admin setup route - creates first admin if none exists
  app.post("/api/auth/setup", async (req: Request, res: Response) => {
    try {
      // Check if any admin exists
      const users = await storage.getUsers();
      
      if (users && users.length > 0) {
        return res.status(403).json({ error: "Setup already completed" });
      }
      
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      
      // Hash the password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create admin user
      const adminUser = await storage.createUser({
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        isAdmin: true
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = adminUser;
      
      res.status(201).json({
        message: "Admin setup completed successfully",
        user: userWithoutPassword
      });
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      
      console.error("Admin setup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  // SEO routes for sitemap.xml and robots.txt
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const posts = await storage.getPosts();
      const categories = await storage.getCategories();
      
      // Start XML creation
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Add homepage
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;
      
      // Add all blog posts
      for (const post of posts) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/posts/${post.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(post.publishedAt).toISOString()}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }
      
      // Add all category pages
      for (const category of categories) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/category/${category.slug}</loc>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
      
      // Close XML
      xml += '</urlset>';
      
      // Send response
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });

  app.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;
    
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // API routes for blog
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Get the post with its comments
      const postWithComments = await storage.getPostWithComments(slug);
      
      res.json(postWithComments);
    } catch (error) {
      console.error(`Error fetching post with slug ${req.params.slug}:`, error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });
  
  // Comment routes
  app.get("/api/posts/:slug/comments", async (req, res) => {
    try {
      const { slug } = req.params;
      const comments = await storage.getCommentsBySlug(slug);
      res.json(comments);
    } catch (error) {
      console.error(`Error fetching comments for post ${req.params.slug}:`, error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });
  
  app.post("/api/posts/:slug/comments", async (req, res) => {
    try {
      const { slug } = req.params;
      const { content, authorName, authorEmail, parentId } = req.body;
      
      const post = await storage.getPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      const newComment = await storage.createComment({
        content,
        postId: post.id,
        authorName,
        authorEmail,
        parentId: parentId || null,
      });
      
      res.status(201).json(newComment);
    } catch (error) {
      console.error(`Error creating comment for post ${req.params.slug}:`, error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });
  
  // Admin routes for comment management (protected by authentication)
  app.patch("/api/comments/:id/approve", authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const commentId = parseInt(id, 10);
      
      if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }
      
      const updatedComment = await storage.approveComment(commentId);
      
      if (!updatedComment) {
        return res.status(404).json({ error: "Comment not found" });
      }
      
      res.json(updatedComment);
    } catch (error) {
      console.error(`Error approving comment ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to approve comment" });
    }
  });
  
  app.delete("/api/comments/:id", authenticate, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const commentId = parseInt(id, 10);
      
      if (isNaN(commentId)) {
        return res.status(400).json({ error: "Invalid comment ID" });
      }
      
      const success = await storage.deleteComment(commentId);
      
      if (!success) {
        return res.status(404).json({ error: "Comment not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting comment ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });
  
  // Get pending comments (for admin review)
  app.get("/api/comments/pending", authenticate, requireAdmin, async (req, res) => {
    try {
      // Get all comments
      const allComments = [];
      const posts = await storage.getPosts();
      
      // For each post, get its comments
      for (const post of posts) {
        const comments = await storage.getComments(post.id);
        const pendingComments = comments.filter(comment => !comment.isApproved);
        
        if (pendingComments.length > 0) {
          allComments.push(...pendingComments.map(comment => ({
            ...comment,
            postTitle: post.title,
            postSlug: post.slug,
          })));
        }
      }
      
      res.json(allComments);
    } catch (error) {
      console.error("Error fetching pending comments:", error);
      res.status(500).json({ error: "Failed to fetch pending comments" });
    }
  });

  app.get("/api/authors", async (req, res) => {
    try {
      const authors = await storage.getAuthors();
      res.json(authors);
    } catch (error) {
      console.error("Error fetching authors:", error);
      res.status(500).json({ error: "Failed to fetch authors" });
    }
  });

  app.get("/api/authors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid author ID" });
      }
      
      const author = await storage.getAuthor(id);
      
      if (!author) {
        return res.status(404).json({ error: "Author not found" });
      }
      
      res.json(author);
    } catch (error) {
      console.error(`Error fetching author with ID ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch author" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
