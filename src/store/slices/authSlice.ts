import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  await authService.initializeAuth();
  return authService.getCurrentUser();
});

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    return authService.signIn(email, password);
  }
);

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) => {
    return authService.signUp(email, password, name);
  }
);

// ✅ FIXED SIGNOUT (IMPORTANT PART)
export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch }) => {
    await authService.signOut();

    // 🔥 force clear Redux state immediately
    dispatch(clearAuthState());
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({
    userId,
    updates,
  }: {
    userId: string;
    updates: Partial<Pick<User, 'name' | 'bio' | 'avatarUri'>>;
  }) => {
    return authService.updateUserProfile(userId, updates);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: state => {
      state.error = null;
    },

    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },

    // 🔥 ADD THIS (important for logout reliability)
    clearAuthState: state => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.initialized = true;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(initializeAuth.pending, state => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload;
      })
      .addCase(initializeAuth.rejected, state => {
        state.loading = false;
        state.initialized = true;
      })

      .addCase(signIn.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Sign in failed';
      })

      .addCase(signUp.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Sign up failed';
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearAuthError, setUser, clearAuthState } = authSlice.actions;
export default authSlice.reducer;