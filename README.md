# SocialConnect 📱

A full-featured React Native social media app implementing authentication, posts, real-time chat, notifications, profiles, follow system, and Firebase integration. Built using Redux Toolkit and modern mobile architecture.

---

## 🚀 Quick Start

```bash
npm install
npm start
````

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

---

## 🔑 Demo Login

```
Email: demo@socialconnect.app
Password: demo123
```

---

## ✨ Features

### 🔐 Authentication

* Login / Signup / Logout
* Forgot Password flow
* Form validation using Formik + Yup
* Persistent session handling

---

### 📝 Posts System

* Create text & image posts
* Upload images (Firebase Storage support)
* Like / Unlike posts
* Comment system
* Real-time feed updates
* Duplicate post issue fixed

---

### 💬 Chat System (Real-time Messaging)

* One-to-one private messaging
* Conversation-based chat structure
* Real-time Firestore updates
* Auto conversation creation
* Last message preview in chat list
* Message notifications support

---

### 🔔 Notifications

* Like notifications
* Comment notifications
* Message notifications
* Real-time notification updates
* Stored in Firebase Firestore

---

### 👤 User Profiles

* View user profiles
* Edit profile (name, bio, avatar)
* View user posts
* Follow / Unfollow system
* Followers / Following lists

---

### 👥 Social Features

* Follow / Unfollow users
* Social feed interaction system
* Profile-based user discovery

---

### 📸 Media Support

* Image upload for posts and profile
* react-native-image-picker integration
* Firebase Storage support

---

## 🧠 State Management

* Redux Toolkit for global state
* Async Thunks for API calls
* Separate slices for:

  * Auth
  * Posts
  * Messages
  * Notifications

---

## 🔥 Backend (Firebase)

* Firebase Authentication
* Cloud Firestore database
* Firebase Storage for media
* Real-time listeners using onSnapshot
* Mock fallback system (AsyncStorage)

---

## 📁 Project Structure

```
src/
  components/     # UI components (PostCard, Buttons, Inputs)
  config/         # Firebase configuration
  hooks/          # Typed Redux hooks
  navigation/     # Auth + Main navigation
  screens/        # All app screens (Auth, Home, Chat, Profile)
  services/       # API + Firebase logic (posts, messages, notifications)
  store/          # Redux slices
  theme/          # Colors & styling system
  types/          # TypeScript models
  utils/          # Helpers (validation, responsive)
```

---

## ⚙️ Installation & Setup

### 1. Clone repository

```bash
git clone https://github.com/your-username/socialconnect.git
cd socialconnect
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Firebase Setup (Optional)

* Create Firebase project
* Enable:

  * Authentication (Email/Password)
  * Firestore Database
  * Storage

Then add config in:

```
src/config/firebase.ts
```

Set:

```
USE_FIREBASE = true
```

---

### 4. Run the App

```bash
npm start
npm run android
```

---

## 📡 Requirements

* Node.js >= 16
* React Native CLI
* Android Studio / Xcode
* Firebase project (optional)

---

## 🧩 Tech Stack

* React Native
* Redux Toolkit
* Firebase (Auth, Firestore, Storage)
* TypeScript
* React Navigation
* Formik + Yup
* React Native Reanimated

---

## 📌 Future Improvements

* Group chats
* Story feature (Instagram-style)
* Push notifications (FCM)
* Post sharing system
* Dark mode improvements
* Advanced search system

---

## 👨‍💻 Author

Built by **Zaynah Nadeem**


