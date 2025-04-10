import OpenAI from "openai";
import { log } from "../vite";
import { BlogPostWithAuthor, ContentPrompt, InsertPost } from "@shared/schema";
import { storage } from "../storage";
import mongoose from "mongoose";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

let openai: OpenAI | null = null;

export function initOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log("OpenAI API key not found. Content generation will not work.", "openai");
    return;
  }

  openai = new OpenAI({ apiKey });
  log("OpenAI client initialized successfully", "openai");
}

export async function generateBlogPost(
  prompt: ContentPrompt,
  assets: string[],
  authorId: any // Accept any type of ID (number for in-memory, ObjectId for MongoDB)
): Promise<InsertPost | null> {
  if (!openai) {
    log("OpenAI client not initialized. Cannot generate content.", "openai");
    return null;
  }

  try {
    // Record the prompt usage
    await storage.recordPromptUsage(prompt.id);

    // Get category information
    // We support both MongoDB ObjectId and numeric id from memory storage
    let category;
    try {
      // First try to get category by direct ID from in-memory storage
      category = await storage.getCategory(prompt.categoryId);
      
      // If category not found and we're using MongoDB integration, the category may need to be fetched directly
      if (!category && typeof prompt.categoryId === 'string' || typeof prompt.categoryId === 'object') {
        const Category = mongoose.model('Category');
        const mongoCategory = await Category.findById(prompt.categoryId);
        if (mongoCategory) {
          // Convert MongoDB category to the format expected by the rest of the code
          category = {
            id: mongoCategory._id,
            name: mongoCategory.name,
            slug: mongoCategory.slug,
            description: mongoCategory.description,
            icon: mongoCategory.icon || ''
          };
        }
      }
    } catch (error) {
      log(`Error retrieving category: ${error}`, "openai");
    }
    
    if (!category) {
      throw new Error(`Category not found for prompt: ${prompt.id}`);
    }

    // Get asset information if provided
    const relatedAssets = assets.length ? assets : [];
    
    // Build the content generation prompt
    const promptTemplate = prompt.promptTemplate
      .replace("{{category}}", category.name)
      .replace("{{assets}}", assets.join(", "));

    // Generate the blog post content
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: 
            "You are a professional finance and cryptocurrency content writer. " +
            "Create high-quality, informative, and engaging content about the topics provided. " +
            "Use an authoritative but accessible tone, include specific details, and make the content valuable to readers " +
            "interested in finance and cryptocurrency. Format the output in markdown."
        },
        {
          role: "user",
          content: promptTemplate
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    // Generate a title from the content
    const titleResponse = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Generate a catchy, SEO-friendly title for this blog post. Keep it under 100 characters."
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const title = titleResponse.choices[0].message.content?.trim() || "Untitled Post";

    // Generate an excerpt from the content
    const excerptResponse = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Create a compelling excerpt/summary for this blog post. Keep it under 200 characters."
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const excerpt = excerptResponse.choices[0].message.content?.trim() || "No excerpt available";

    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);

    // Extract tags from the content
    const tagsResponse = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "Extract 3-5 relevant tags from this content. Respond with JSON in this format: { \"tags\": [\"tag1\", \"tag2\", \"tag3\"] }"
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 150,
    });

    let tags: string[] = [];
    try {
      const tagsData = JSON.parse(tagsResponse.choices[0].message.content || "{}");
      tags = tagsData.tags || [];
    } catch (error) {
      log(`Error parsing tags: ${error}`, "openai");
      tags = [category.name];
    }

    // Estimate reading time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Randomly select a cover image
    const coverImages = [
      "https://images.unsplash.com/photo-1621761191319-4a3f68df7e75?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80", // Crypto trading
      "https://images.unsplash.com/photo-1518544801976-5e22eb212d25?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80", // Bitcoin
      "https://images.unsplash.com/photo-1625643257258-71050e92f720?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80", // Finance
      "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80", // Stock market
      "https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=600&q=80", // Ethereum
    ];
    const coverImage = coverImages[Math.floor(Math.random() * coverImages.length)];

    // Create the post data
    const postData: InsertPost = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      publishedAt: new Date(),
      readingTime,
      authorId,
      categoryId: category.id,
      isGenerated: true,
      relatedAssets,
      tags,
    };

    return postData;
  } catch (error) {
    log(`Error generating blog post: ${error}`, "openai");
    return null;
  }
}