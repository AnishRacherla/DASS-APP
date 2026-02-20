# Mobile App Setup & Testing Guide

## ✅ What Has Been Updated

All features from the web frontend have been ported to the mobile app:

### New Features Added:
1. **PlanetHome Screen** - Main hub showing Earth/Mars planets with total score
2. **Lessons Screen** - 20 image/word pairs with audio playback
3. **MarsLevelSelection Screen** - Choose between Level 1 (3 images) and Level 2 (4 images)
4. **MarsGame Screen** - Word matching game with audio and images
5. **Updated Results Screen** - Handles Quiz, Balloon, and Mars games with score saving
6. **Updated Navigation** - Complete flow from Homepage → PlanetHome → Games → Results

### Technical Updates:
- ✅ Backend API configuration updated (port 5001)
- ✅ Audio playback using expo-av
- ✅ Image loading from backend server
- ✅ Score tracking with AsyncStorage
- ✅ Mars unlock logic (complete 20 lessons)
- ✅ All navigation routes added to App.js

## 📱 Testing on Android Studio

### Prerequisites:
1. Android Studio installed
2. Android Emulator configured
3. Backend server running on port 5001

### Backend Configuration:
The mobile app is configured to connect to: `http://10.0.2.2:5001`
- This is the correct address for Android Emulator to reach `localhost` on your host machine
- If testing on a real device, update `mobile/src/config.js` with your computer's IP address

### Steps to Run:

1. **Start Backend Server** (from project root):
   ```bash
   cd backend
   npm start
   ```
   Verify it's running at http://localhost:5001

2. **Start Android Emulator**:
   - Open Android Studio
   - Launch your Android Virtual Device (AVD)
   - Wait for emulator to fully boot

3. **Start Mobile App** (from mobile directory):
   ```bash
   cd mobile
   npm start
   ```
   or
   ```bash
   npx expo start
   ```

4. **Run on Emulator**:
   - Press `a` in the terminal to open on Android
   - Or scan QR code with Expo Go app (for physical device)

### Configuration Notes:

#### For Android Emulator:
- Backend URL: `http://10.0.2.2:5001` (already configured)
- No changes needed

#### For Real Android Device:
1. Find your computer's IP address:
   ```bash
   # On Mac/Linux:
   ifconfig | grep "inet "
   
   # On Windows:
   ipconfig
   ```

2. Update `mobile/src/config.js`:
   ```javascript
   export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5001';
   ```

3. Make sure your phone and computer are on the same WiFi network

## 🎮 App Flow

```
Homepage
  └─> Enter name & select language
      └─> PlanetHome
          ├─> Earth Planet
          │   ├─> Quiz (Ocean/Land/Mountains)
          │   ├─> Balloon Pop (3 levels)
          │   └─> Results → PlanetHome
          │
          ├─> Learn 20 Words Button
          │   └─> Lessons (1-20)
          │       └─> (After completing 20) → Unlocks Mars
          │
          └─> Mars Planet (🔒 Locked until 20 lessons done)
              └─> Level Selection
                  ├─> Level 1 (3 images, 4 questions)
                  └─> Level 2 (4 images, 2 questions)
                      └─> Results → PlanetHome
```

## 🎯 Features Checklist

### Navigation & Screens:
- ✅ Homepage with language selection
- ✅ PlanetHome hub with score display
- ✅ GameSelection (Earth games)
- ✅ Lessons (20 word pairs)
- ✅ MarsLevelSelection
- ✅ MarsGame
- ✅ Results screen for all game types

### Audio Features:
- ✅ Lessons play word pronunciation
- ✅ Mars game plays word audio
- ✅ Audio button shows only if audio available
- ✅ Uses expo-av for audio playback

### Score Tracking:
- ✅ Saves scores to backend
- ✅ Displays total score on PlanetHome
- ✅ Shows score breakdown by game type
- ✅ Prevents duplicate score counting

### Game Logic:
- ✅ Mars unlock after completing 20 lessons
- ✅ Progress saved in AsyncStorage
- ✅ Consistent navigation to PlanetHome
- ✅ Exit buttons return to correct screens

## 🔧 Troubleshooting

### Cannot connect to backend:
1. Check backend is running: `curl http://localhost:5001/api/users`
2. For emulator, verify using: `http://10.0.2.2:5001`
3. For real device, check WiFi and IP address

### Audio not playing:
1. Check backend audio files at: `backend/assets/audio/hindi/` and `/telugu/`
2. Verify backend serves audio: `curl http://localhost:5001/audio/hindi/Dog_Hindi.mp4.mp3`
3. Check Expo AV permissions (should be automatic)

### Images not loading:
1. Verify backend serves images: `curl http://localhost:5001/images/hindi/dog.png`
2. Check network inspector in React Native Debugger
3. Ensure backend static middleware is configured

### Mars not unlocking:
1. Complete all 20 lessons
2. Check AsyncStorage: `lessonsCompleted_hindi` or `lessonsCompleted_telugu`
3. Restart app to refresh unlock status

### Metro bundler issues:
```bash
# Clear cache and restart
cd mobile
npx expo start -c
```

## 📝 Code Structure

```
mobile/
├── App.js                          # Navigation setup
├── src/
│   ├── config.js                   # Backend API URL
│   └── screens/
│       ├── Homepage.js             # Entry point
│       ├── PlanetHome.js           # NEW: Main hub
│       ├── GameSelection.js        # Earth games menu
│       ├── PlanetSelection.js      # Quiz planet levels
│       ├── BalloonSelection.js     # Balloon levels
│       ├── Quiz.js                 # Audio quiz game
│       ├── BalloonGame.js          # Balloon pop game
│       ├── Lessons.js              # NEW: 20 word lessons
│       ├── MarsLevelSelection.js   # NEW: Mars level menu
│       ├── MarsGame.js             # NEW: Word matching game
│       └── Results.js              # UPDATED: All game results
```

## 🚀 Next Steps for Testing

1. **Your friend should**:
   - Pull latest code
   - Ensure backend is running
   - Start Android emulator
   - Run `cd mobile && npm install && npx expo start`
   - Press `a` to open on Android

2. **Test Flow**:
   - Create user with name
   - Select Hindi or Telugu
   - Check PlanetHome appears with Earth/Mars
   - Play Earth games (Quiz/Balloon)
   - Complete 20 lessons (test at least first few)
   - Verify Mars unlocks after lesson 20
   - Play Mars Level 1 and Level 2
   - Check scores appear on PlanetHome

3. **Audio Testing**:
   - Tap 🔊 buttons in Lessons
   - Tap 🔊 buttons in Mars game
   - Verify audio plays for each word

## 🐛 Known Issues & Limitations

1. **No iOS testing yet** - Only Android has been configured
2. **Audio files** - Must be present in backend/assets/audio/
3. **Network required** - App needs backend connection (no offline mode)
4. **File watcher issues** - May need to run with `--legacy-watch-peers` flag

## 📦 Dependencies Used

- `expo-av`: ^14.0.0 (audio playback)
- `@react-native-async-storage/async-storage`: 1.23.1 (local storage)
- `axios`: ^1.7.9 (API calls)
- `@react-navigation/native`: ^6.1.18 (navigation)
- `expo`: ~51.0.0 (framework)

All dependencies are already in package.json - just run `npm install`

## ✨ Summary

The mobile app now has **complete feature parity** with the web frontend:
- ✅ Planet-based learning system
- ✅ 20 interactive lessons with images and audio
- ✅ Mars word matching game (2 levels)
- ✅ Full score tracking and progress
- ✅ Consistent navigation flow
- ✅ Audio playback for all learning content

Your friend can now test the complete mobile experience on Android Studio!
