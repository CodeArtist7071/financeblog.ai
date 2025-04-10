import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
});

export const insertAuthorSchema = createInsertSchema(authors).omit({
  id: true,
});

export type InsertAuthor = z.infer<typeof insertAuthorSchema>;
export type Author = typeof authors.$inferSelect;

// Combined blog post type with author information
export type BlogPostWithAuthor = Post & {
  author: Author;
};
