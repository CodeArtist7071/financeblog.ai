import mongoose from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, mongoose.Document {}

const categorySchema = new mongoose.Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    icon: {
      type: String,
      default: 'category'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for posts in this category
categorySchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'categoryId'
});

export const Category = mongoose.model<ICategoryDocument>('Category', categorySchema);