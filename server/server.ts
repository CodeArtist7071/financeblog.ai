import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import categoryRoutes from './routes/category.routes';
import commentRoutes from './routes/comment.routes';
import topicRoutes from './routes/topic.routes';
import generationRoutes from './routes/generation.routes';
import cronRoutes from './routes/cron.routes';
import seoRoutes from './routes/seo.routes';

// Import DB connection
import connectDB from './db/mongoose';

// Load environment variables with proper error handling
const envResult = dotenv.config();
if (envResult.error) {
  console.error('Error loading .env file:', envResult.error);
  process.exit(1);
}

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file or environment configuration.');
  // Don't exit - allow app to potentially run with defaults
}

// Log optional environment variables status
const optionalEnvVars = [
  'OPENAI_API_KEY',
  'CRON_SECRET'
];

optionalEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`Warning: Optional environment variable ${envVar} is not set.`);
    if (envVar === 'OPENAI_API_KEY') {
      console.warn('OpenAI content generation features will not be available.');
    } else if (envVar === 'CRON_SECRET') {
      console.warn('Cron job API endpoints will not be secure without a CRON_SECRET.');
    }
  }
});

// Connect to MongoDB
connectDB();

const app: Express = express();

// Import custom middleware
import corsMiddleware from './middleware/cors.middleware';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configure CORS with more specific options based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com'] // Use actual frontend URL in production
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'], // Common development ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Cron-Secret'],
  credentials: true, // Allow cookies and authentication headers
  maxAge: 86400, // Cache preflight requests for 24 hours
  optionsSuccessStatus: 204, // Return 204 for preflight requests
};

// Apply CORS middleware from cors package
app.use(cors(corsOptions));

// Apply our custom CORS middleware to ensure headers on all responses including errors
app.use(corsMiddleware);

// Log CORS configuration
console.log(`CORS enabled with origins: ${JSON.stringify(corsOptions.origin)}`);

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/generation', generationRoutes);
app.use('/cron', cronRoutes); // Cron endpoint for scheduled tasks

// SEO routes - these are outside the /api path for direct access
app.use('/', seoRoutes);

// Custom error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Any route that is not an API route will be redirected to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Create HTTP server
const httpServer = createServer(app);

// Define port
const PORT = process.env.PORT || 5000;

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default httpServer;