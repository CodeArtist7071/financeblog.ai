import axios, { AxiosError } from 'axios';
import { BlogPostWithAuthor, PostWithComments, ContentPrompt, Category } from '@shared/schema';
import { toast } from '@/hooks/use-toast';

// Create an axios instance with common configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic error handler that shows toast notifications for errors
const handleApiError = (error: unknown, customMessage?: string): never => {
  console.error('API Error:', error);
  
  // Default error message
  let errorMessage = customMessage || 'An unexpected error occurred';
  
  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Use the server's error message if available
    if (axiosError.response?.data && typeof axiosError.response.data === 'object' && 'error' in axiosError.response.data) {
      errorMessage = axiosError.response.data.error as string;
    } else if (axiosError.response?.statusText) {
      errorMessage = axiosError.response.statusText;
    }
    
    // Handle common status codes
    if (axiosError.response && axiosError.response.status === 401) {
      errorMessage = 'Authentication required. Please log in.';
    } else if (axiosError.response && axiosError.response.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (axiosError.response && axiosError.response.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (axiosError.response && axiosError.response.status === 422) {
      errorMessage = 'Validation error. Please check your input.';
    } else if (axiosError.response && axiosError.response.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  
  // Show toast notification
  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  });
  
  throw error;
};

// Success handler for toast notifications
const handleApiSuccess = (message: string): void => {
  toast({
    title: 'Success',
    description: message,
  });
};

// Helper to get auth header with token if it exists
const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Blog post related API calls
export const blogApi = {
  // Get all blog posts
  getAllPosts: async (): Promise<BlogPostWithAuthor[]> => {
    try {
      const response = await api.get('/posts', {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch blog posts');
    }
  },

  // Get a single blog post with comments
  getPost: async (slug: string): Promise<PostWithComments> => {
    try {
      const response = await api.get(`/posts/${slug}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch blog post "${slug}"`);
    }
  },

  // Get posts by category
  getPostsByCategory: async (categorySlug: string): Promise<BlogPostWithAuthor[]> => {
    try {
      const response = await api.get(`/categories/${categorySlug}/posts`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch posts for category "${categorySlug}"`);
    }
  },

  // Submit a comment on a blog post
  submitComment: async (postSlug: string, commentData: { 
    authorName: string; 
    authorEmail: string; 
    content: string;
    parentId?: number | null;
  }) => {
    try {
      const response = await api.post(`/posts/${postSlug}/comments`, commentData, {
        headers: getAuthHeader(),
      });
      handleApiSuccess('Your comment has been submitted for approval');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to submit comment');
    }
  },
};

// Blog content generation API calls
export const contentGenApi = {
  // Get all content generation prompts
  getPrompts: async (): Promise<ContentPrompt[]> => {
    try {
      const response = await api.get('/content-prompts', {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch content prompts');
    }
  },

  // Get prompts by category
  getPromptsByCategory: async (categoryId: number): Promise<ContentPrompt[]> => {
    try {
      const response = await api.get(`/categories/${categoryId}/content-prompts`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch content prompts for this category');
    }
  },

  // Check if OpenAI API key is configured
  checkOpenAIKey: async (): Promise<boolean> => {
    try {
      const response = await api.get('/check-openai-key', {
        headers: getAuthHeader(),
      });
      return response.data.configured;
    } catch (error) {
      handleApiError(error, 'Failed to check OpenAI API key');
      return false;
    }
  },

  // Generate blog content
  generateBlogPost: async (data: {
    promptId: number;
    assets: string[];
    tone: string;
    length: number;
    categoryId: number;
    keywords: string[];
  }) => {
    try {
      // Check if OpenAI API key is configured
      const isKeyConfigured = await contentGenApi.checkOpenAIKey();
      
      if (!isKeyConfigured) {
        toast({
          title: 'API Key Required',
          description: 'OpenAI API key is not configured. Please ask your administrator to set it up.',
          variant: 'destructive',
        });
        throw new Error('OpenAI API key is not configured');
      }
      
      // Show a toast that generation is starting
      toast({
        title: 'Generating content',
        description: 'This may take a minute or two...',
      });
      
      const response = await api.post('/generate-content', data, {
        headers: {
          ...getAuthHeader(),
        },
      });
      
      handleApiSuccess('Blog post successfully generated!');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to generate blog content');
    }
  },
};

// Categories API
export const categoryApi = {
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/categories', {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch categories');
    }
  },

  getCategory: async (slug: string): Promise<Category> => {
    try {
      const response = await api.get(`/categories/${slug}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch category "${slug}"`);
    }
  },
};

// Auth related API calls
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      handleApiSuccess('Login successful');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Login failed');
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout', {}, {
        headers: getAuthHeader(),
      });
      localStorage.removeItem('auth_token');
      handleApiSuccess('You have been logged out');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Logout failed');
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me', {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      // Don't show an error toast for this one - it's expected to fail when not logged in
      return null;
    }
  },
};

// Comment moderation API calls (admin only)
export const commentApi = {
  getPendingComments: async () => {
    try {
      const response = await api.get('/comments/pending', {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch pending comments');
    }
  },

  approveComment: async (commentId: number) => {
    try {
      const response = await api.patch(`/comments/${commentId}/approve`, {}, {
        headers: getAuthHeader(),
      });
      handleApiSuccess('Comment approved successfully');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to approve comment');
    }
  },

  deleteComment: async (commentId: number) => {
    try {
      const response = await api.delete(`/comments/${commentId}`, {
        headers: getAuthHeader(),
      });
      handleApiSuccess('Comment deleted successfully');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to delete comment');
    }
  },
};