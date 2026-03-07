# App Icon Setup for APK Build

Before building your APK, you should add app icons. If you don't add them, Expo will use default icons.

## Required Icon Files

Create an `assets` folder in the `mobile` directory with these files:

### 1. **icon.png** (1024x1024 pixels)
- Main app icon
- Should be a square PNG with no transparency
- Used for iOS app icon

### 2. **adaptive-icon.png** (1024x1024 pixels)
- Android adaptive icon (foreground)
- Should be a square PNG
- The middle 512x512 pixels should contain your logo
- Outer areas may be cropped on some devices

### 3. **splash.png** (1284x2778 pixels or similar)
- Splash screen image shown when app launches
- Can be your logo centered on a background
- Background color will be #0B0C2A (as configured)

## Quick Option: Use Expo's Default Icons

If you want to build quickly without custom icons:

1. Comment out or remove these lines from `app.json`:
   ```json
   "icon": "./assets/icon.png",
   "splash": {
     "image": "./assets/splash.png",
     ...
   },
   ```

2. Keep the adaptive icon reference but Expo will generate one

## Creating Icons

### Option 1: Design Your Own
- Use any design tool (Figma, Photoshop, Canva, etc.)
- Export at the required dimensions
- Save as PNG files in the `mobile/assets` folder

### Option 2: Use Online Tools
- **Icon Generator:** https://www.appicon.co/
- **Expo Icon Generator:** https://icon.kitchen/

### Option 3: Placeholder Icons
For testing purposes, you can create simple colored squares:
- Create 1024x1024 px images with your app name text
- Use a solid background color
- Add text in the center

## Folder Structure

```
mobile/
  ├── assets/
  │   ├── icon.png           (1024x1024)
  │   ├── adaptive-icon.png  (1024x1024)
  │   └── splash.png         (1284x2778 or larger)
  ├── app.json
  ├── eas.json
  └── BUILD_APK_GUIDE.md
```

## After Adding Icons

Once you've added your icon files, proceed with the build as described in `BUILD_APK_GUIDE.md`.

## Note

The project ID in `app.json` will be automatically added when you run your first `eas build` command.
