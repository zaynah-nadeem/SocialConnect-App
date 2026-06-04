import type { AppNotification } from '../types';

let notificationId = 0;

export function createNotification(
  partial: Omit<AppNotification, 'id' | 'read' | 'createdAt'>,
): AppNotification {
  notificationId += 1;
  return {
    ...partial,
    id: `notif_${notificationId}_${Date.now()}`,
    read: false,
    createdAt: new Date().toISOString(),
  };
}

/** In-app notifications; wire FCM / Notifee here for push when configured. */
export function notifyLike(
  postOwnerId: string,
  currentUserId: string,
  currentUserName: string,
  postId: string,
): AppNotification | null {
  if (postOwnerId === currentUserId) {
    return null;
  }
  return createNotification({
    type: 'like',
    message: `${currentUserName} liked your post`,
    postId,
    fromUserId: currentUserId,
    fromUserName: currentUserName,
  });
}

export function notifyComment(
  postOwnerId: string,
  currentUserId: string,
  currentUserName: string,
  postId: string,
): AppNotification | null {
  if (postOwnerId === currentUserId) {
    return null;
  }
  return createNotification({
    type: 'comment',
    message: `${currentUserName} commented on your post`,
    postId,
    fromUserId: currentUserId,
    fromUserName: currentUserName,
  });
}
