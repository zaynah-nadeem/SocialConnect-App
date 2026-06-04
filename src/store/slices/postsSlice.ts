import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as postsService from '../../services/postsService';
import { notifyComment, notifyLike } from '../../services/notificationService';
import type { Post } from '../../types';
import type { RootState } from '../index';
import { addNotification } from './notificationsSlice';

interface PostsState {
  items: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk('posts/fetch', async () => {
  return postsService.fetchPosts();
});

export const createPost = createAsyncThunk(
  'posts/create',
  async (
    { text, imageUri }: { text: string; imageUri?: string },
    { getState },
  ) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    return postsService.createPost(
      user.id,
      user.name,
      user.avatarUri,
      text,
      imageUri,
    );
  },
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) {
      throw new Error('Not authenticated');
    }

    
    const currentPost = state.posts.items.find(p => p.id === postId);

    const wasAlreadyLiked = currentPost?.likeIds.includes(user.id);

    const updatedPost = await postsService.toggleLike(postId, user.id);

  
    const isNowLiked = updatedPost.likeIds.includes(user.id);

    if (!wasAlreadyLiked && isNowLiked) {
      const notification = notifyLike(
        updatedPost.userId,
        user.id,
        user.name,
        updatedPost.id,
      );

      if (notification) {
        dispatch(addNotification(notification));
      }
      
    }

    return updatedPost;
  },
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async (
    { postId, text }: { postId: string; text: string },
    { getState, dispatch },
  ) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    if (!user) {
      throw new Error('Not authenticated');
    }
    const post = await postsService.addComment(
      postId,
      user.id,
      user.name,
      text,
    );
    const notification = notifyComment(
      post.userId,
      user.id,
      user.name,
      post.id,
    );
    if (notification) {
      dispatch(addNotification(notification));
    }
    return post;
  },
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action: { payload: Post[] }) => {
      state.items = action.payload;
    },
    upsertPost: (state, action: { payload: Post }) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, state => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load posts';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { setPosts, upsertPost } = postsSlice.actions;
export default postsSlice.reducer;
