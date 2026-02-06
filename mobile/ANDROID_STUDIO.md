# 🤖 Running in Android Studio Emulator

## Prerequisites

### 1. Install Android Studio
```bash
# Download from: https://developer.android.com/studio
# Or install via snap:
sudo snap install android-studio --classic
```

### 2. Setup Android SDK

**Open Android Studio:**
1. Welcome screen → **More Actions** → **SDK Manager**
2. **SDK Platforms** tab → Check **Android 13.0 (Tiramisu)** or higher
3. **SDK Tools** tab → Install:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator
   - Android SDK Command-line Tools

### 3. Add to Environment Variables

Add these lines to `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload:
```bash
source ~/.bashrc
```

### 4. Create Virtual Device (AVD)

**In Android Studio:**
1. Tools → **Device Manager**
2. Click **Create Device**
3. Select a phone (e.g., **Pixel 5**)
4. Select system image (e.g., **Android 13.0 - API 33**)
5. Click **Finish**

---

## 🚀 Quick Start

### Method 1: Automatic Script (Recommended)

```bash
./start-android-studio.sh
```

This script will:
- Check Android SDK installation
- Start emulator automatically
- Start backend server
- Launch app in emulator

### Method 2: Manual Steps

**Step 1: Start Android Emulator**

```bash
# List available emulators
$ANDROID_HOME/emulator/emulator -list-avds

# Start an emulator (replace with your AVD name)
$ANDROID_HOME/emulator/emulator -avd Pixel_5_API_33 &
```

**Step 2: Verify Emulator Connection**

```bash
# Check connected devices
adb devices
# Should show: emulator-5554	device
```

**Step 3: Start Backend**

```bash
cd backend
node server.js
```

**Step 4: Start Mobile App**

```bash
cd mobile
npm start
```

**Step 5: Launch in Emulator**

Press **`a`** in the terminal to open Android app in emulator, or run:

```bash
npm run android
```

---

## 🔧 Troubleshooting

### "adb command not found"

Android SDK not installed or PATH not configured.

**Fix:**
```bash
# Check if SDK exists
ls ~/Android/Sdk

# If exists, add to PATH
echo 'export ANDROID_HOME=$HOME/Android/Sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

### "No emulator running"

**Start emulator manually:**
```bash
# List AVDs
$ANDROID_HOME/emulator/emulator -list-avds

# Start first available
$ANDROID_HOME/emulator/emulator -avd $(emulator -list-avds | head -n 1) &
```

### "Cannot connect to backend"

Emulator uses special IP for localhost:
- Android Emulator: Use `10.0.2.2` instead of `localhost`

**Update config for emulator:**

Edit `mobile/src/config.js`:
```javascript
// For Android Emulator
export const API_BASE_URL = 'http://10.0.2.2:5000';

// For real device
// export const API_BASE_URL = 'http://10.2.143.103:5000';
```

### "App installation failed"

Clear cache and rebuild:
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --clear
```

---

## 📱 Emulator vs Real Device

| Feature | Emulator | Real Device |
|---------|----------|-------------|
| **Setup** | Complex (Android Studio) | Easy (Expo Go app) |
| **Performance** | Slower | Faster |
| **Testing** | Desktop only | Real-world conditions |
| **Backend URL** | `10.0.2.2:5000` | `10.2.143.103:5000` |
| **Install** | Auto-installs APK | Runs via Expo Go |

---

## ⚡ Quick Commands

```bash
# Check Android setup
adb --version
$ANDROID_HOME/emulator/emulator -version

# List emulators
$ANDROID_HOME/emulator/emulator -list-avds

# List connected devices
adb devices

# Restart ADB
adb kill-server && adb start-server

# Install APK manually
adb install app.apk

# View emulator logs
adb logcat | grep ReactNative
```

---

## 🎯 Next Steps

1. **Install Android Studio** if not installed
2. **Setup SDK** and create AVD
3. **Configure environment** variables
4. Run **`./start-android-studio.sh`**
5. App opens in emulator! 🎉

For real device testing (easier), use:
```bash
./start-mobile.sh  # Uses Expo Go + QR code
```
