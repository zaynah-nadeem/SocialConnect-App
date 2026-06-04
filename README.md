# SocialConnect

A React Native social app implementing the 3-week curriculum: authentication, navigation, profiles, posts, likes/comments, Redux state, notifications, real-time sync, and animations.

## Quick start

```bash
npm install
npm start
# In another terminal:
npm run android
# or
npm run ios
```

**Demo login:** `demo@socialconnect.app` / `demo123`

## Features by week

### Week 1
- React Native project with ESLint & Prettier
- **Auth:** Login, Sign Up, Forgot Password (Formik + Yup)
- **Backend:** Mock API (AsyncStorage) by default; Firebase Auth optional
- **Navigation:** Stack (auth + modals) + Bottom tabs (Home, Profile, Settings)
- **Profile:** Edit name, bio, avatar (`react-native-image-picker`)

### Week 2
- **Feed:** Create text/image posts, FlatList, timestamps
- **Likes & comments:** Animated like button, comments screen
- **Profiles:** View other users from feed author tap
- **State:** Redux Toolkit (auth, posts, notifications)

### Week 3
- **Notifications:** In-app notification center (likes/comments on your posts)
- **Real-time:** Firestore listeners when Firebase enabled; 3s polling in mock mode
- **UI:** `react-native-reanimated` like animation, `react-native-responsive-dimensions`
- **Polish:** Memoized post cards, session persistence, error alerts

## Firebase setup (optional)

1. Create a Firebase project and enable **Authentication** (Email/Password) and **Firestore**.
2. Copy config into `src/config/firebase.ts` and set `USE_FIREBASE = true`.
3. Create Firestore collections: `users`, `posts` (documents match types in `src/types`).

For push notifications (FCM), add native FCM setup and extend `src/services/notificationService.ts`.

## Project structure

```
src/
  components/     # PostCard, LikeButton, AuthTextField, ...
  config/         # Firebase config
  hooks/          # Typed Redux hooks
  navigation/     # Auth stack, main tabs, root navigator
  screens/        # Auth, main tabs, modals
  services/       # Auth, posts, mock storage, notifications
  store/          # Redux slices
  theme/          # Colors
  types/          # TypeScript models
  utils/          # Validation schemas, responsive helpers
```

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm start`    | Metro bundler            |
| `npm run android` | Run on Android      |
| `npm run ios`  | Run on iOS (macOS)       |
| `npm run lint` | ESLint                   |
| `npm test`     | Jest                     |
