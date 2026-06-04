import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppNotification } from '../../types';

interface NotificationsState {
  items: AppNotification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      state.items.unshift(action.payload);
    },
    markAllRead: state => {
      state.items.forEach(n => {
        n.read = true;
      });
    },
    markRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find(n => n.id === action.payload);
      if (item) {
        item.read = true;
      }
    },
    clearNotifications: state => {
      state.items = [];
    },
  },
});

export const {
  addNotification,
  markAllRead,
  markRead,
  clearNotifications,
} = notificationsSlice.actions;

export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.items.filter(n => !n.read).length;

export default notificationsSlice.reducer;
