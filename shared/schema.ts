import { pgTable, text, serial, integer, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Crypto categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Crypto assets schema
export const cryptoAssets = pgTable("crypto_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  symbol: text("symbol").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  logo: text("logo").notNull(),
  currentPrice: real("current_price").notNull(),
  marketCap: real("market_cap").notNull(),
  volume24h: real("volume_24h").notNull(),
  priceChange24h: real("price_change_24h").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  categoryId: integer("category_id").notNull(),
});

export const insertCryptoAssetSchema = createInsertSchema(cryptoAssets).omit({
  id: true,
});

export type InsertCryptoAsset = z.infer<typeof insertCryptoAssetSchema>;
export type CryptoAsset = typeof cryptoAssets.$inferSelect;

// Blog post schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  readingTime: integer("reading_time").notNull(),
  authorId: integer("author_id").notNull(),
  categoryId: integer("category_id").notNull(),
  isGenerated: boolean("is_generated").notNull().default(true),
  relatedAssets: text("related_assets").array().notNull(),
  tags: text("tags").array().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Author schema
export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  picture: text("picture").notNull(),
  bio: text("bio").notNull(),
  title: text("title").notNull(),
  twitterHandle: text("twitter_handle"),
  linkedinProfile: text("linkedin_profile"),
});

export const insertAuthorSchema = createInsertSchema(authors).omit({
  id: true,
});

export type InsertAuthor = z.infer<typeof insertAuthorSchema>;
export type Author = typeof authors.$inferSelect;

// Generation prompts for auto-generated content
export const contentPrompts = pgTable("content_prompts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  promptTemplate: text("prompt_template").notNull(),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsed: timestamp("last_used"),
  timesUsed: integer("times_used").notNull().default(0),
});

export const insertContentPromptSchema = createInsertSchema(contentPrompts).omit({
  id: true,
  timesUsed: true,
  lastUsed: true,
});

export type InsertContentPrompt = z.infer<typeof insertContentPromptSchema>;
export type ContentPrompt = typeof contentPrompts.$inferSelect;

// Comment schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id"),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isApproved: boolean("is_approved").notNull().default(false),
  parentId: integer("parent_id"),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  isApproved: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Combined types
export type BlogPostWithAuthor = Post & {
  author: Author;
  category: Category;
};

export type CryptoAssetWithCategory = CryptoAsset & {
  category: Category;
};

export type CommentWithReplies = Comment & {
  replies?: CommentWithReplies[];
};

export type PostWithComments = BlogPostWithAuthor & {
  comments: CommentWithReplies[];
};
