# TaskTracker

A cross-platform Task Management App built with React Native.

## Architecture Choice

This project was built using **Bare React Native CLI** rather than Expo to demonstrate full capability in native iOS/Android configuration, which is standard for enterprise environments.

- **State Management:** `@reduxjs/toolkit` for predictable state management across the app.
- **Navigation:** `@react-navigation/native` utilizing native stack for optimal performance.
- **Offline-First Database:** `@op-engineering/op-sqlite`, a blazingly fast JSI-based SQLite wrapper, ensures tasks can be managed completely offline.
- **Cloud Sync:** A custom Sync Engine runs in the background. It listens for network connectivity changes via `@react-native-community/netinfo` and pushes local SQLite changes to Firestore, or pulls remote changes from Firestore to SQLite.

## Libraries Used
- `@react-navigation/native`
- `@reduxjs/toolkit`
- `@op-engineering/op-sqlite`
- `@react-native-firebase/app` (Auth, Firestore)
- `@notifee/react-native`
- `react-native-config`
- `@react-native-community/netinfo`

## How to run the app in each environment

1. Install dependencies:
   ```bash
   yarn install
   cd ios && pod install && cd ..
   ```

2. Add your Firebase config files:
   - Android: Place `google-services.json` in `android/app/`
   - iOS: Place `GoogleService-Info.plist` in `ios/`

3. Run the environments:
   ```bash
   # Development
   ENVFILE=.env.dev npx react-native run-ios
   ENVFILE=.env.dev npx react-native run-android

   # Staging
   ENVFILE=.env.staging npx react-native run-ios
   ENVFILE=.env.staging npx react-native run-android

   # Production
   ENVFILE=.env.prod npx react-native run-ios
   ENVFILE=.env.prod npx react-native run-android
   ```

## Known Limitations
- The sync engine currently uses a "last write wins" strategy based on `updated_at`. In a highly collaborative environment, operational transform (OT) or CRDTs would be preferred.
- Push notifications are scheduled locally via Notifee. The bonus requirement (FCM server pushes) requires a backend function (like Firebase Cloud Functions) to trigger the push, which is outside the scope of this frontend repository, but the client is ready to receive them via `@react-native-firebase/messaging`.
