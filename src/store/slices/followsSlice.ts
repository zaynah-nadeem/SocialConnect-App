import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as followService from '../../services/followService';

interface FollowsState {
  followingIds: string[];
  loading: boolean;
}

const initialState: FollowsState = {
  followingIds: [],
  loading: false,
};

export const loadFollowing = createAsyncThunk(
  'follows/load',
  async (userId: string) => {
    return followService.getFollowingIds(userId);
  },
);

export const followUser = createAsyncThunk(
  'follows/follow',
  async ({
    followerId,
    followingId,
  }: {
    followerId: string;
    followingId: string;
  }) => {
    await followService.followUser(followerId, followingId);
    return followingId;
  },
);

export const unfollowUser = createAsyncThunk(
  'follows/unfollow',
  async ({
    followerId,
    followingId,
  }: {
    followerId: string;
    followingId: string;
  }) => {
    await followService.unfollowUser(followerId, followingId);
    return followingId;
  },
);

const followsSlice = createSlice({
  name: 'follows',
  initialState,
  reducers: {
    setFollowingIds: (state, action: { payload: string[] }) => {
      state.followingIds = action.payload;
    },
    clearFollows: state => {
      state.followingIds = [];
      state.loading = false;
    },
    addFollowingId: (state, action: { payload: string }) => {
      if (!state.followingIds.includes(action.payload)) {
        state.followingIds.push(action.payload);
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadFollowing.pending, state => {
        state.loading = true;
      })
      .addCase(loadFollowing.fulfilled, (state, action) => {
        state.loading = false;
        state.followingIds = action.payload;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        if (!state.followingIds.includes(action.payload)) {
          state.followingIds.push(action.payload);
        }
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followingIds = state.followingIds.filter(
          id => id !== action.payload,
        );
      });
  },
});

export const { setFollowingIds, clearFollows, addFollowingId } =
  followsSlice.actions;
export default followsSlice.reducer;
