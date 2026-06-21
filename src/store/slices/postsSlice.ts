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
  lastCreatedId: string | null;
}

const initialState: PostsState = {
  items: [],
  loading: false,
  error: null,
  lastCreatedId: null,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetch',
  async () => {
    return await postsService.fetchPosts();
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (
    { text, imageUri }: { text: string; imageUri?: string },
    { getState }
  ) => {
    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) throw new Error('Not authenticated');

    const post = await postsService.createPost(
      user.id,
      user.name,
      user.avatarUri,
      text,
      imageUri
    );

    return post;
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async (
    {
      postId,
      text,
      imageUri,
    }: {
      postId: string;
      text: string;
      imageUri?: string;
    },
    { getState }
  ) => {
    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) throw new Error('Not authenticated');

    return await postsService.updatePost(postId, user.id, {
      text,
      imageUri,
    });
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId: string, { getState }) => {
    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) throw new Error('Not authenticated');

    await postsService.deletePost(postId, user.id);
    return postId;
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) throw new Error('Not authenticated');

    const current = state.posts.items.find(p => p.id === postId);
    const wasLiked = current?.likeIds.includes(user.id);

    const updated = await postsService.toggleLike(postId, user.id);
    const isLikedNow = updated.likeIds.includes(user.id);

    if (!wasLiked && isLikedNow) {
      const notification = notifyLike(
        updated.userId,
        user.id,
        user.name,
        updated.id
      );

      if (notification) {
        dispatch(addNotification(notification));
      }
    }

    return updated;
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async (
    { postId, text }: { postId: string; text: string },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) throw new Error('Not authenticated');

    const post = await postsService.addComment(
      postId,
      user.id,
      user.name,
      text
    );

    const notification = notifyComment(
      post.userId,
      user.id,
      user.name,
      post.id
    );

    if (notification) {
      dispatch(addNotification(notification));
    }

    return post;
  }
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

    clearPosts: state => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.lastCreatedId = null;
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

      // ✅ FIXED: no duplicate insert here
      .addCase(createPost.fulfilled, state => {
        state.lastCreatedId = null;
      })

      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })

      .addCase(toggleLike.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
      })

      .addCase(addComment.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index >= 0) state.items[index] = action.payload;
      });
  },
});

export const { setPosts, upsertPost, clearPosts } = postsSlice.actions;
export default postsSlice.reducer;