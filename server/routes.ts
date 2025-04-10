import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      res.json(post);
    } catch (error) {
      console.error(`Error fetching post with slug ${req.params.slug}:`, error);
      res.status(500).json({ error: "Failed to fetch post" });
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
