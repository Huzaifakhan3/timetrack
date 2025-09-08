# Time Tracker Pro - iOS App

A beautiful, modern time tracking application built with React Native and Expo.

## Features

- ⏱️ Multiple independent stopwatch timers
- 📊 Real-time statistics dashboard
- 💾 Persistent data storage with AsyncStorage
- 🎨 Modern iOS-style design with glassmorphism effects
- 📱 Fully responsive and optimized for iOS
- ✨ Smooth animations with React Native Reanimated
- 🔄 Haptic feedback for better user experience
- 🎯 Native iOS alerts and interactions

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Xcode) or physical iOS device with Expo Go app

### Installation

1. Navigate to the project directory:
   ```bash
   cd TimeTrackerPro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on iOS:
   ```bash
   npm run ios
   ```

### Building for Production

To build the app for the App Store:

```bash
expo build:ios
```

## App Structure

- **App.tsx** - Main application component with timer logic
- **app.json** - Expo configuration
- **package.json** - Dependencies and scripts

## Key Dependencies

- **React Native Reanimated** - Smooth animations
- **AsyncStorage** - Local data persistence
- **Expo Linear Gradient** - Beautiful gradient effects
- **Expo Haptics** - Native haptic feedback
- **Expo Vector Icons** - iOS-style icons

## Design Features

- **Glassmorphism UI** with backdrop blur effects
- **Gradient backgrounds** and accent colors
- **Animated status indicators** for running timers
- **Native iOS alerts** for confirmations
- **Haptic feedback** for all interactions
- **Responsive layout** optimized for all iOS devices

## Usage

1. **Add Timer**: Enter a name and tap "Add" to create a new timer
2. **Start/Pause**: Tap the play/pause button to control timers
3. **Reset**: Reset individual timers to zero
4. **Delete**: Remove timers with confirmation dialog
5. **Stats**: View real-time statistics at the top of the screen

The app automatically saves your timers and will restore them when you reopen the app.