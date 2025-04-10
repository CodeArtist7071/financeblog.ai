import express from 'express';
import {
  getPosts,
  getPostBySlug,
  getPostsByCategory,
  createPost,
  updatePost,
  deletePost
} from '../controllers/post.controller';
import { protect, admin } from '../middleware/auth.middleware';
import { createComment, getCommentsByPost } from '../controllers/comment.controller';

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/:slug', getPostBySlug);

// Comment routes
router.route('/:postId/comments')
  .post(createComment)
  .get(getCommentsByPost);

// Admin routes
router.route('/')
  .post(protect, admin, createPost);

router.route('/:id')
  .put(protect, admin, updatePost)
  .delete(protect, admin, deletePost);

export default router;