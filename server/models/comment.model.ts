import mongoose from 'mongoose';

export interface IComment {
  content: string;
  postId: mongoose.Types.ObjectId;
  authorName: string;
  authorEmail: string;
  isApproved: boolean;
  parentId: mongoose.Types.ObjectId | null;
  userId: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentDocument extends IComment, mongoose.Document {}

const commentSchema = new mongoose.Schema<ICommentDocument>(
  {
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post ID is required']
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    authorEmail: {
      type: String,
      required: [true, 'Author email is required'],
      trim: true,
      lowercase: true
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for replies to this comment
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId'
});

export const Comment = mongoose.model<ICommentDocument>('Comment', commentSchema);