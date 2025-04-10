import mongoose from 'mongoose';

export interface IGenerationSchedule {
  topicId: mongoose.Types.ObjectId | null; // null if it's a scheduled generation without a specific topic
  title: string; // Topic title or custom title for generation
  description: string; // Topic description or custom prompt 
  categoryId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId; // The admin who created the schedule
  scheduledFor: Date;
  status: 'pending' | 'completed' | 'failed';
  generatedPostId: mongoose.Types.ObjectId | null; // The post that was generated
  errorMessage: string | null; // In case of failure
  createdAt: Date;
  updatedAt: Date;
}

export interface IGenerationScheduleDocument extends IGenerationSchedule, mongoose.Document {}

const generationScheduleSchema = new mongoose.Schema<IGenerationScheduleDocument>(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null
    },
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
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    scheduledFor: {
      type: Date,
      required: [true, 'Scheduled date is required']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    generatedPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const GenerationSchedule = mongoose.model<IGenerationScheduleDocument>('GenerationSchedule', generationScheduleSchema);