import { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "finance-blog-jwt-secret";
const TOKEN_EXPIRY = "7d";

// Generate JWT token
function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      isAdmin: user.isAdmin
    }, 
    JWT_SECRET, 
    { expiresIn: TOKEN_EXPIRY }
  );
}

// Middleware to authenticate user
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or header
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Verify token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Get user
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Set authenticated user on request
    (req as any).user = user;
    next();
    
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware to require admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Setup auth routes
export function setupAuth(app: Express) {
  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      
      // Return user (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Register route
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin: false, // Default to non-admin
      });
      
      // Generate JWT token
      const token = generateToken(newUser);
      
      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      
      // Return user (without password)
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
      
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Register admin route (protected)
  app.post("/api/auth/register-admin", authenticate, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create admin user
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin: true, // Create as admin
      });
      
      // Return user (without password)
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
      
    } catch (error) {
      console.error("Admin registration error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  // Logout route
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });
  
  // Get current user
  app.get("/api/auth/me", authenticate, (req: Request, res: Response) => {
    const { password: _, ...userWithoutPassword } = (req as any).user;
    res.json(userWithoutPassword);
  });
}