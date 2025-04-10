import mongoose from 'mongoose';

export interface ITopic {
  title: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'generated';
  userId: mongoose.Types.ObjectId | null; // Optional, if submitted by a logged-in user
  email: string; // For guest submissions
  scheduledFor: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicDocument extends ITopic, mongoose.Document {}

const topicSchema = new mongoose.Schema<ITopicDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'generated'],
      default: 'pending'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    email: {
      type: String,
      required: [function(this: ITopicDocument) {
        return this.userId === null; // Email is required only if userId is not provided
      }, 'Email is required for guest submissions'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    scheduledFor: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Topic = mongoose.model<ITopicDocument>('Topic', topicSchema);