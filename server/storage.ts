import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  authors, type Author, type InsertAuthor,
  type BlogPostWithAuthor
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  getPosts(): Promise<BlogPostWithAuthor[]>;
  getPostBySlug(slug: string): Promise<BlogPostWithAuthor | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  
  // Author methods
  getAuthor(id: number): Promise<Author | undefined>;
  getAuthors(): Promise<Author[]>;
  createAuthor(author: InsertAuthor): Promise<Author>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private authors: Map<number, Author>;
  private userIdCounter: number;
  private postIdCounter: number;
  private authorIdCounter: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.authors = new Map();
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.authorIdCounter = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Post methods
  async getPosts(): Promise<BlogPostWithAuthor[]> {
    return Array.from(this.posts.values()).map(post => {
      const author = this.authors.get(post.authorId);
      if (!author) {
        throw new Error(`Author not found for post ${post.id}`);
      }
      return { ...post, author };
    }).sort((a, b) => {
      // Sort by publishedAt in descending order (newest first)
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }
  
  async getPostBySlug(slug: string): Promise<BlogPostWithAuthor | undefined> {
    const post = Array.from(this.posts.values()).find(post => post.slug === slug);
    if (!post) return undefined;
    
    const author = this.authors.get(post.authorId);
    if (!author) return undefined;
    
    return { ...post, author };
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const post: Post = { ...insertPost, id };
    this.posts.set(id, post);
    return post;
  }
  
  // Author methods
  async getAuthor(id: number): Promise<Author | undefined> {
    return this.authors.get(id);
  }
  
  async getAuthors(): Promise<Author[]> {
    return Array.from(this.authors.values());
  }
  
  async createAuthor(insertAuthor: InsertAuthor): Promise<Author> {
    const id = this.authorIdCounter++;
    const author: Author = { ...insertAuthor, id };
    this.authors.set(id, author);
    return author;
  }
  
  // Initialize with sample data
  private initSampleData() {
    // Create sample authors
    const alexJohnson: Author = {
      id: this.authorIdCounter++,
      name: "Alex Johnson",
      picture: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      bio: "Full-stack developer specializing in React and TypeScript."
    };
    this.authors.set(alexJohnson.id, alexJohnson);
    
    const sarahMiller: Author = {
      id: this.authorIdCounter++,
      name: "Sarah Miller",
      picture: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      bio: "Frontend developer and CSS specialist."
    };
    this.authors.set(sarahMiller.id, sarahMiller);
    
    const michaelChen: Author = {
      id: this.authorIdCounter++,
      name: "Michael Chen",
      picture: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      bio: "JavaScript developer and state management expert."
    };
    this.authors.set(michaelChen.id, michaelChen);
    
    const jessicaPark: Author = {
      id: this.authorIdCounter++,
      name: "Jessica Park",
      picture: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      bio: "Backend developer with expertise in Node.js and Express."
    };
    this.authors.set(jessicaPark.id, jessicaPark);
    
    // Create sample posts
    const post1: Post = {
      id: this.postIdCounter++,
      title: "Building a Blog with Next.js and TypeScript",
      slug: "building-blog-nextjs-typescript",
      excerpt: "Learn how to build a modern blog using Next.js with TypeScript and TailwindCSS. This comprehensive guide walks you through setup, configuration and deployment.",
      content: `
# Building a Blog with Next.js and TypeScript

Next.js has emerged as one of the most popular React frameworks, enabling developers to build fast, SEO-friendly applications with server-side rendering capabilities. When combined with TypeScript and TailwindCSS, it creates a powerful development stack for modern web applications.

In this comprehensive guide, we'll walk through setting up a blog using Next.js, TypeScript, and TailwindCSS. We'll cover everything from initial setup to deployment, with a focus on creating a clean, maintainable codebase.

## Setting Up Your Next.js Project

Let's start by creating a new Next.js project with TypeScript support. Open your terminal and run:

\`\`\`
npx create-next-app@latest my-blog --typescript
cd my-blog
\`\`\`

This command creates a new Next.js project with TypeScript configuration. Now, let's add TailwindCSS to our project:

\`\`\`
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

## Folder Structure

For a scalable blog application, we'll organize our code with the following structure:

\`\`\`
my-blog/
  ├── components/        # Reusable UI components
  ├── layouts/           # Page layouts
  ├── lib/               # Utility functions
  ├── pages/             # Next.js pages
  ├── public/            # Static assets
  ├── styles/            # Global styles
  ├── types/             # TypeScript type definitions
  └── content/           # Blog post content (Markdown)
\`\`\`

## Creating Blog Components

We'll need several key components for our blog:

- **Header**: Navigation and branding
- **Footer**: Links and copyright information
- **BlogList**: Grid of blog post cards
- **BlogCard**: Individual post preview
- **BlogPost**: Full article layout

Let's focus on implementing the BlogCard component as an example:

\`\`\`typescript
// components/BlogCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
      <div className="flex-shrink-0">
        <Image
          className="h-48 w-full object-cover"
          src={post.coverImage}
          alt={post.title}
          width={600}
          height={240}
        />
      </div>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-indigo-600">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 
                rounded-full text-xs font-medium bg-indigo-100 
                text-indigo-800 mr-2"
              >
                {tag}
              </span>
            ))}
          </p>
          <Link href={\`/blog/\${post.slug}\`}>
            <a className="block mt-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {post.title}
              </h3>
              <p className="mt-3 text-base text-gray-500">
                {post.excerpt}
              </p>
            </a>
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <Image
              className="h-10 w-10 rounded-full"
              src={post.author.picture}
              alt={post.author.name}
              width={40}
              height={40}
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {post.author.name}
            </p>
            <div className="flex text-sm text-gray-500">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString()}
              </time>
              <span className="mx-1">·</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
\`\`\`

## Conclusion

In this tutorial, we've walked through setting up a Next.js blog with TypeScript and TailwindCSS. This stack provides an excellent foundation for building modern, type-safe, and visually appealing blog applications.

In future articles, we'll dive deeper into advanced topics like:

- Implementing dynamic routes for blog posts
- Setting up an API for retrieving blog data
- Adding authentication for admin features
- Optimizing performance and SEO

Stay tuned for more in-depth guides on modern web development!
      `,
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80",
      publishedAt: new Date("2023-06-15"),
      readingTime: 8,
      authorId: alexJohnson.id,
      tags: ["TypeScript", "Next.js"]
    };
    this.posts.set(post1.id, post1);
    
    const post2: Post = {
      id: this.postIdCounter++,
      title: "Mastering TailwindCSS: From Basics to Advanced",
      slug: "mastering-tailwindcss-basics-advanced",
      excerpt: "Discover the power of utility-first CSS frameworks. This article covers TailwindCSS fundamentals, optimization techniques, and advanced component strategies.",
      content: `
# Mastering TailwindCSS: From Basics to Advanced

Tailwind CSS has revolutionized the way we write CSS by providing a utility-first approach that enables rapid UI development without leaving your HTML. In this comprehensive guide, we'll explore everything from the basics to advanced techniques.

## Getting Started with Tailwind

First, let's set up Tailwind in a new project:

\`\`\`bash
npm init -y
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
\`\`\`

Configure your \`tailwind.config.js\` file:

\`\`\`javascript
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
\`\`\`

Create a CSS file to include Tailwind:

\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;
\`\`\`

## Building Components with Tailwind

One of the advantages of Tailwind is creating consistent components. Here's an example of a card component:

\`\`\`html
<div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
  <div class="md:flex">
    <div class="md:shrink-0">
      <img class="h-48 w-full object-cover md:w-48" src="/img/example.jpg" alt="Modern building architecture">
    </div>
    <div class="p-8">
      <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">Company retreats</div>
      <a href="#" class="block mt-1 text-lg leading-tight font-medium text-black hover:underline">Incredible accommodation for your team</a>
      <p class="mt-2 text-slate-500">Looking to take your team away on a retreat to enjoy awesome food and take in some sunshine?</p>
    </div>
  </div>
</div>
\`\`\`

## Advanced Techniques

### Custom Utilities

You can extend Tailwind with your own utilities:

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
      }
    }
  }
}
\`\`\`

### Responsive Design

Tailwind makes responsive design incredibly easy with its mobile-first approach:

\`\`\`html
<div class="text-center sm:text-left md:text-right lg:text-justify">
  Responsive text alignment
</div>
\`\`\`

### Dark Mode

Implementing dark mode is straightforward:

\`\`\`javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
\`\`\`

Then in your HTML:

\`\`\`html
<html class="dark">
<body class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <!-- Content -->
</body>
</html>
\`\`\`

## Optimization for Production

For production, make sure to optimize your CSS:

\`\`\`javascript
// tailwind.config.js
module.exports = {
  purge: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  // ...
}
\`\`\`

## Conclusion

Tailwind CSS offers a powerful, flexible approach to styling that can dramatically speed up your development workflow. By learning these techniques, you'll be well-equipped to build beautiful, responsive interfaces efficiently.

Remember that the true power of Tailwind lies in its composability - combining simple utilities to create complex designs without writing custom CSS.
      `,
      coverImage: "https://images.unsplash.com/photo-1635830625698-3b9bd74671ca?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80",
      publishedAt: new Date("2023-06-10"),
      readingTime: 6,
      authorId: sarahMiller.id,
      tags: ["TailwindCSS", "CSS"]
    };
    this.posts.set(post2.id, post2);
    
    const post3: Post = {
      id: this.postIdCounter++,
      title: "State Management in Modern React Applications",
      slug: "state-management-modern-react-applications",
      excerpt: "An in-depth look at state management approaches in React. Compare Redux, Context API, Recoil and other popular solutions to find what's best for your project.",
      content: `
# State Management in Modern React Applications

State management is a crucial aspect of building React applications, especially as they grow in complexity. This article explores various state management solutions and provides guidance on choosing the right one for your projects.

## React's Built-in State Management

React provides several built-in options for managing state:

### useState Hook

The most basic way to add state to a functional component:

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\`

### useReducer Hook

For more complex state logic:

\`\`\`jsx
import { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
    </div>
  );
}
\`\`\`

### Context API

For sharing state across components without prop drilling:

\`\`\`jsx
import { createContext, useContext, useState } from 'react';

const CountContext = createContext();

function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  );
}

function CountDisplay() {
  const { count } = useContext(CountContext);
  return <p>Count: {count}</p>;
}

function CountButton() {
  const { count, setCount } = useContext(CountContext);
  return <button onClick={() => setCount(count + 1)}>Increment</button>;
}
\`\`\`

## External State Management Libraries

### Redux

Redux is one of the most popular state management libraries:

\`\`\`jsx
// store.js
import { createStore } from 'redux';

const initialState = { count: 0 };

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

const store = createStore(reducer);
export default store;

// Component.jsx
import { useSelector, useDispatch } from 'react-redux';

function Counter() {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>Increment</button>
    </div>
  );
}
\`\`\`

### Recoil

A newer library from Facebook:

\`\`\`jsx
import { atom, useRecoilState } from 'recoil';

const countState = atom({
  key: 'countState',
  default: 0,
});

function Counter() {
  const [count, setCount] = useRecoilState(countState);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
\`\`\`

## Choosing the Right Solution

The best state management solution depends on your application's needs:

- For small applications: React's built-in useState and useContext are often sufficient
- For medium-sized applications: Consider Context API with useReducer
- For large applications: Redux, Recoil, or other external libraries provide more structure and developer tools

Factors to consider:
- Team familiarity
- Application complexity
- Performance requirements
- Developer experience

## Conclusion

Modern React offers multiple approaches to state management, each with its own strengths. Start with the simplest solution that meets your needs, and scale up as your application grows. The React ecosystem continues to evolve, so stay updated with the latest tools and best practices.
      `,
      coverImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80",
      publishedAt: new Date("2023-06-05"),
      readingTime: 12,
      authorId: michaelChen.id,
      tags: ["JavaScript", "React"]
    };
    this.posts.set(post3.id, post3);
    
    const post4: Post = {
      id: this.postIdCounter++,
      title: "Building RESTful APIs with Express and TypeScript",
      slug: "building-restful-apis-express-typescript",
      excerpt: "Learn how to create robust, type-safe APIs using Express and TypeScript. This tutorial covers project setup, middleware, error handling, and testing.",
      content: `
# Building RESTful APIs with Express and TypeScript

Express is one of the most popular web frameworks for Node.js, and when combined with TypeScript, it provides a powerful foundation for building robust, type-safe APIs. This tutorial will guide you through creating a RESTful API with Express and TypeScript.

## Setting Up Your Project

Let's start by creating a new project:

\`\`\`bash
mkdir express-typescript-api
cd express-typescript-api
npm init -y
\`\`\`

Install the required dependencies:

\`\`\`bash
npm install express cors helmet
npm install -D typescript @types/express @types/node @types/cors ts-node nodemon
\`\`\`

Create a TypeScript configuration file (\`tsconfig.json\`):

\`\`\`json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
\`\`\`

## Project Structure

Let's organize our project with a clean structure:

\`\`\`
src/
├── controllers/    # Request handlers
├── models/         # Data models
├── routes/         # Route definitions
├── middleware/     # Custom middleware
├── services/       # Business logic
├── utils/          # Utility functions
└── app.ts          # Express application setup
\`\`\`

## Creating the Express Application

Let's start with our main application file (\`src/app.ts\`):

\`\`\`typescript
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred'
  });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

export default app;
\`\`\`

## Defining Types for Your API

TypeScript allows us to define clear interfaces for our data:

\`\`\`typescript
// src/models/User.ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}
\`\`\`

## Creating Controllers

Controllers handle the request logic:

\`\`\`typescript
// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { User, CreateUserDTO } from '../models/User';
import * as UserService from '../services/user.service';

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await UserService.findAll();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users' });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const userData: CreateUserDTO = req.body;
    const newUser = await UserService.create(userData);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user' });
  }
}
\`\`\`

## Setting Up Routes

Organize your routes clearly:

\`\`\`typescript
// src/routes/user.routes.ts
import { Router } from 'express';
import * as UserController from '../controllers/user.controller';

const router = Router();

router.get('/', UserController.getAllUsers);
router.post('/', UserController.createUser);

export default router;

// src/routes/index.ts
import { Router } from 'express';
import userRoutes from './user.routes';

const router = Router();

router.use('/users', userRoutes);

export default router;
\`\`\`

## Middleware for Authentication and Validation

Creating middleware for common tasks:

\`\`\`typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header required' });
  }
  
  // Implement your authentication logic here
  // For example, validate a JWT token
  
  next();
}
\`\`\`

## Testing Your API

You can use Jest for testing:

\`\`\`typescript
// tests/users.test.ts
import request from 'supertest';
import app from '../src/app';

describe('User API', () => {
  it('should get all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
  
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'Test User',
        email: 'test@example.com'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });
});
\`\`\`

## Conclusion

Building RESTful APIs with Express and TypeScript provides several advantages:

1. Type safety reduces runtime errors
2. Better IDE support with autocompletion
3. Clearer code organization and maintainability
4. Enhanced developer experience

As your API grows, consider adding features like rate limiting, caching, and comprehensive documentation with tools like Swagger. TypeScript's static typing will help you maintain a robust codebase even as complexity increases.
      `,
      coverImage: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=500&q=80",
      publishedAt: new Date("2023-05-28"),
      readingTime: 10,
      authorId: jessicaPark.id,
      tags: ["Express", "Node.js"]
    };
    this.posts.set(post4.id, post4);
  }
}

export const storage = new MemStorage();
