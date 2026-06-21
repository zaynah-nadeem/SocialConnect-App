import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as messagesService from '../../services/messagesService';
import type { Conversation, Message } from '../../types';
import type { RootState } from '../index';

interface MessagesState {
  conversations: Conversation[];
  activeMessages: Message[];
  loading: boolean;
}

const initialState: MessagesState = {
  conversations: [],
  activeMessages: [],
  loading: false,
};

export const loadConversations = createAsyncThunk(
  'messages/loadConversations',
  async (userId: string) => {
    return await messagesService.fetchConversations(userId);
  },
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (
    {
      conversationId,
      text,
      senderId,
      senderName,
      receiverId,
    }: {
      conversationId: string;
      text: string;
      senderId: string;
      senderName: string;
      receiverId: string;
    },
  ) => {
    return await messagesService.sendMessage(
      conversationId,
      senderId,
      senderName,
      text,
      receiverId,
    );
  },
);

export const startConversation = createAsyncThunk(
  'messages/startConversation',
  async (
    {
      otherUserId,
      otherUserName,
    }: { otherUserId: string; otherUserName: string },
    { getState },
  ) => {
    const state = getState() as RootState;
    const user = state.auth.user;

    if (!user) throw new Error('Not authenticated');

    return await messagesService.getOrCreateConversation(
      user.id,
      user.name,
      otherUserId,
      otherUserName,
    );
  },
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action: { payload: Conversation[] }) => {
      state.conversations = action.payload;
    },

    setActiveMessages: (state, action: { payload: Message[] }) => {
      state.activeMessages = action.payload;
    },

    clearMessages: state => {
      state.conversations = [];
      state.activeMessages = [];
      state.loading = false;
    },
  },

  extraReducers: builder => {
    builder
      // conversations loading
      .addCase(loadConversations.pending, state => {
        state.loading = true;
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(loadConversations.rejected, state => {
        state.loading = false;
      })

      // sendMessage (NO UI UPDATE HERE — snapshot handles it)
      .addCase(sendMessage.fulfilled, state => {
        state.loading = false;
      })

      // startConversation (optional: could refresh list later)
      .addCase(startConversation.fulfilled, state => {
        state.loading = false;
      });
  },
});

export const {
  setConversations,
  setActiveMessages,
  clearMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;