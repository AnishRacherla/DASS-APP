# 🚀 Quick Start Guide for Testing Mobile App

## For Your Friend with Android Studio

Hey! The mobile app has been completely updated with all the new features. Here's what you need to do:

---

## ⚡ Quick Setup (5 minutes)

### 1. Pull Latest Code
```bash
git pull origin main
```

### 2. Install Dependencies (if needed)
```bash
cd mobile
npm install
```

### 3. Start Backend Server
```bash
# Open a new terminal
cd backend
npm start
```

✅ **Verify**: You should see "Server is running on port 5001"

### 4. Start Android Emulator
- Open Android Studio
- Click "AVD Manager" (phone icon)
- Start your Android Virtual Device
- Wait until it fully loads

### 5. Start Mobile App
```bash
# In another terminal
cd mobile
npx expo start
```

### 6. Launch on Emulator
- Press `a` in the terminal (or)
- Press `Shift + a` if `a` doesn't work
- App should install and open on emulator

---

## 🎮 What to Test

### Complete Flow Test (10 minutes):

1. **Homepage**
   - [ ] Enter your name
   - [ ] Select Hindi or Telugu
   - [ ] Click "Start Learning"

2. **PlanetHome Screen** (NEW!)
   - [ ] Should see Earth 🌍 and Mars 🔴 planets
   - [ ] Mars should be locked 🔒
   - [ ] See "Learn 20 Words" button

3. **Test Earth Games**
   - [ ] Click Earth planet
   - [ ] Play Audio Quiz
   - [ ] Play Balloon Pop
   - [ ] Check Results screen appears
   - [ ] Return to PlanetHome (not homepage)

4. **Test Lessons** (NEW! - Main feature)
   - [ ] Click "Learn 20 Words" button
   - [ ] See first word with image
   - [ ] **Tap 🔊 Play Sound button** - AUDIO SHOULD PLAY
   - [ ] Click "Next" a few times
   - [ ] Click "Previous" to go back
   - [ ] See progress counter (1/20, 2/20, etc.)
   - [ ] Click "Exit" to return to PlanetHome
   - [ ] *Optional*: Complete all 20 to unlock Mars

5. **Test Mars Game** (NEW!)
   - [ ] Complete all 20 lessons (or manually unlock*)
   - [ ] Mars planet should be unlocked
   - [ ] Click Mars planet
   - [ ] Choose Level 1
   - [ ] **Hear audio automatically play**
   - [ ] See 3 images
   - [ ] Tap correct image
   - [ ] See green checkmark ✓
   - [ ] Tap wrong image
   - [ ] See red X ✗
   - [ ] Complete game
   - [ ] Check Results
   - [ ] Return to PlanetHome
   - [ ] Try Level 2 (4 images instead of 3)

6. **Test Score Tracking** (NEW!)
   - [ ] Play a few games
   - [ ] Return to PlanetHome
   - [ ] See total score displayed
   - [ ] See breakdown (Quiz: X, Balloon: X, Mars: X)

---

## 🎯 Key Features to Verify

### Audio Playback:
- ✅ Lessons: Tap 🔊 button to hear word pronunciation
- ✅ Mars Game: Audio plays automatically for each question
- ✅ Mars Game: Tap 🔊 Replay button to hear again

### Images:
- ✅ Lessons: See clear image for each word
- ✅ Mars Game: See 3 or 4 image options

### Navigation:
- ✅ All games return to PlanetHome (not Homepage)
- ✅ Exit buttons work from everywhere
- ✅ Back buttons don't crash

### Scoring:
- ✅ Scores save after each game
- ✅ Total score shows on PlanetHome
- ✅ Playing same game updates score (not duplicate)

### Mars Unlock:
- ✅ Mars locked initially
- ✅ Complete 20 lessons unlocks Mars
- ✅ Unlock persists after restarting app

---

## 🐛 If Something Doesn't Work

### Audio Not Playing:
1. Check terminal for errors
2. Try restarting app
3. Check backend logs - should see audio file requests
4. Verify: `curl http://localhost:5001/audio/hindi/Dog_Hindi.mp4.mp3`

### Images Not Loading:
1. Check backend is running
2. Verify: `curl http://localhost:5001/images/hindi/dog.png`
3. Restart app

### "Cannot connect to server":
1. Backend must be running on port 5001
2. Check terminal shows: "Server is running on port 5001"
3. Android Emulator uses `10.0.2.2` instead of `localhost`

### Mars Not Unlocking:
**Quick unlock for testing** (skip 20 lessons):
```javascript
// Open React Native debugger and run:
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.setItem('lessonsCompleted_hindi', 'true');
// Then restart app
```

### App Crashes:
1. Check terminal for error messages
2. Try: `npx expo start -c` (clear cache)
3. Restart emulator

---

## 📱 Testing on Real Phone (Optional)

If you want to test on your actual phone:

1. **Get Computer IP**:
   ```bash
   # Run in terminal:
   ipconfig getifaddr en0   # Mac WiFi
   # or
   ifconfig | grep "inet "   # Mac all
   # or
   ipconfig                   # Windows
   ```

2. **Update Config**:
   - Open `mobile/src/config.js`
   - Change: `export const API_BASE_URL = 'http://YOUR_IP:5001';`
   - Example: `'http://192.168.1.100:5001'`

3. **Same WiFi**:
   - Phone and computer must be on same WiFi network

4. **Scan QR Code**:
   - Install "Expo Go" app from Play Store
   - Scan QR code from terminal

---

## 🎉 What's New in Mobile App

Compared to old version, now includes:

### New Screens:
1. **PlanetHome** - Hub with Earth/Mars and score display
2. **Lessons** - 20 interactive word lessons with audio
3. **MarsLevelSelection** - Choose Mars difficulty
4. **MarsGame** - Word matching game

### New Features:
- 🔊 Audio playback for all learning content
- 🖼️ Images from backend server
- 📊 Complete score tracking system
- 🔓 Mars unlock progression
- 🔄 Updated navigation flow

### Updated:
- Results screen handles all game types
- Homepage navigates to PlanetHome
- All games return to PlanetHome
- Score saving to backend

---

## 📊 Expected Behavior

### First Time User:
1. Create account → PlanetHome
2. See Earth (unlocked) and Mars (locked)
3. Play Earth games
4. Complete 20 lessons
5. Mars unlocks
6. Play Mars games
7. Score accumulates

### Returning User:
- Mars stays unlocked
- Scores persist
- Can play any game

---

## ✅ Success Criteria

If these work, everything is good:

- [ ] Can create user and see PlanetHome
- [ ] Audio plays in Lessons (MOST IMPORTANT)
- [ ] Audio plays in Mars Game
- [ ] Images load correctly
- [ ] Can complete a full game
- [ ] Score appears on PlanetHome
- [ ] Mars unlocks after 20 lessons
- [ ] Can play Mars Level 1 and 2
- [ ] Navigation doesn't crash
- [ ] Exit buttons work

---

## 📸 What to Check

Take screenshots/record if:
- ✅ Everything works perfectly
- ❌ Audio doesn't play
- ❌ Images don't load
- ❌ App crashes
- ❌ Navigation broken

Share any errors from terminal!

---

## 💬 Questions?

Check these files:
- `mobile/MOBILE_UPDATE_GUIDE.md` - Detailed setup guide
- `mobile/CHANGES_SUMMARY.md` - What changed and why
- Terminal output - Shows errors

---

## 🎊 That's It!

The app should work smoothly. Main things to test:
1. **Audio in Lessons** 🔊
2. **Audio in Mars Game** 🔊
3. **Images loading** 🖼️
4. **Score tracking** 📊
5. **Mars unlock** 🔓

**Estimated testing time**: 15-20 minutes for full flow

Good luck! 🚀
