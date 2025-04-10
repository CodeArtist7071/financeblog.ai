import mongoose from 'mongoose';

export interface IPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishedAt: Date;
  readingTime: number;
  authorId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  isGenerated: boolean;
  relatedAssets: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDocument extends IPost, mongoose.Document {}

const postSchema = new mongoose.Schema<IPostDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required']
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    readingTime: {
      type: Number,
      default: 5
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    isGenerated: {
      type: Boolean,
      default: false
    },
    relatedAssets: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for comments
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'postId'
});

export const Post = mongoose.model<IPostDocument>('Post', postSchema);