# React Native Literacy Game - Setup & Run Guide

## 📱 What Was Converted

Your MERN web app has been converted to React Native (Android/iOS native mobile app):

### ✅ Changes Made:
- React → React Native
- HTML elements → React Native components (`<div>` → `<View>`, `<button>` → `<TouchableOpacity>`)
- CSS → React Native StyleSheet
- React Router → React Navigation
- Web audio → Expo AV (native audio)
- localStorage → AsyncStorage (native storage)
- All 4 screens converted: Homepage, PlanetSelection, Quiz, Results

### ✅ Backend (No Changes):
- Backend stays the same (Node.js + Express + MongoDB)
- All APIs work as-is
- Audio served from MongoDB

---

## 🚀 Steps to Run the Android App

### **Step 1: Install Dependencies**

```bash
# Navigate to mobile folder
cd /home/raviteja/Documents/dass_game/mobile

# Install all packages
npm install
```

### **Step 2: Update Backend URL**

**IMPORTANT:** Edit the file `mobile/src/config.js`:

```javascript
// Find your computer's IP address first:
// Run in terminal: ip addr show | grep "inet " | grep -v 127.0.0.1

export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000';
// Example: export const API_BASE_URL = 'http://192.168.1.100:5000';
```

**How to find your IP:**
```bash
# On Linux:
hostname -I | awk '{print $1}'

# Or
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### **Step 3: Make Sure Backend is Running**

```bash
# In a separate terminal, start backend
cd /home/raviteja/Documents/dass_game/backend
node server.js
```

Backend should be running on `http://0.0.0.0:5000` (accessible from phone)

### **Step 4: Start the React Native App**

```bash
# From mobile folder
cd /home/raviteja/Documents/dass_game/mobile

# Start Expo development server
npm start
```

You'll see a QR code in the terminal.

### **Step 5: Run on Android Device/Emulator**

**Option A: Real Android Phone (Recommended)**

1. Install **Expo Go** app from Google Play Store
2. Connect phone to same WiFi as your computer
3. Open Expo Go app
4. Scan the QR code from terminal
5. App will load and run!

**Option B: Android Emulator**

1. Install Android Studio
2. Set up an Android emulator (AVD)
3. Start the emulator
4. In terminal, press `a` to run on Android emulator

---

## 📝 Quick Commands

```bash
# Install dependencies
cd /home/raviteja/Documents/dass_game/mobile
npm install

# Start app
npm start

# Run on Android directly
npm run android

# Clear cache if issues
expo start -c
```

---

## 🔧 Troubleshooting

### **"Cannot connect to backend"**
- Make sure backend is running: `node server.js`
- Check `src/config.js` has correct IP (not localhost)
- Phone and computer must be on same WiFi
- Firewall might be blocking port 5000

### **Audio not playing**
- Check MongoDB has audio data: `node seeds/seedQuizzes.js`
- Verify audio API endpoint works: `curl http://YOUR_IP:5000/api/audio/hindi/1/1`
- Make sure phone has volume on

### **"Module not found" errors**
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Building APK for Distribution

Once app works, build a standalone APK:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas login
eas build:configure

# Build APK
eas build --platform android --profile preview
```

This creates an APK file you can install on any Android phone (no Expo Go needed).

---

## 📱 App Structure

```
mobile/
├── App.js                    # Navigation setup
├── src/
│   ├── config.js            # Backend API URL ← EDIT THIS
│   └── screens/
│       ├── Homepage.js      # Language selection & registration
│       ├── PlanetSelection.js  # Level selection
│       ├── Quiz.js          # Quiz gameplay
│       └── Results.js       # Score & results
├── package.json             # Dependencies
└── app.json                 # Expo configuration
```

---

## ✨ Key Differences from Web App

| Feature | Web App | Mobile App |
|---------|---------|------------|
| Components | HTML (`<div>`, `<button>`) | React Native (`<View>`, `<TouchableOpacity>`) |
| Styling | CSS files | StyleSheet objects |
| Navigation | React Router | React Navigation |
| Storage | localStorage | AsyncStorage |
| Audio | HTML5 Audio | Expo AV |
| Platform | Browser | Android/iOS native |

---

## 🎯 Testing Checklist

- [ ] Backend running on network IP (not localhost)
- [ ] Updated `src/config.js` with correct IP
- [ ] MongoDB seeded with audio data
- [ ] Phone and computer on same WiFi
- [ ] Expo Go app installed on phone
- [ ] Scan QR code and launch app
- [ ] Test: Register user
- [ ] Test: Select planet
- [ ] Test: Play audio in quiz
- [ ] Test: Complete quiz and see results

---

## 🚀 Next Steps

1. Run `npm install` in mobile folder
2. Update IP in `src/config.js`
3. Start backend
4. Run `npm start` in mobile folder
5. Scan QR with Expo Go app
6. Play the game!

---

**Your app is now a native Android/iOS mobile application! 🎉**
