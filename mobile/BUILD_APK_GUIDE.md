# Building Standalone APK for Literacy Game Mobile App

This guide will help you build a standalone APK that can be installed directly on Android devices without needing Expo Go.

## Prerequisites

1. **Node.js and npm** installed on your system
2. **An Expo account** (free) - Sign up at https://expo.dev
3. **EAS CLI** installed globally

## Step-by-Step Build Instructions

### Step 1: Install EAS CLI

Open PowerShell or Command Prompt and run:

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

Navigate to the mobile directory and login:

```bash
cd mobile
eas login
```

Enter your Expo account credentials (or create a new account if you don't have one).

### Step 3: Configure Your Project

Initialize EAS Build (if not already done):

```bash
eas build:configure
```

This will use the `eas.json` file that's already been created in your project.

### Step 4: Build the APK

To build a preview APK (best for testing):

```bash
eas build --platform android --profile preview
```

**OR** to build a production APK:

```bash
eas build --platform android --profile production
```

**Note:** The first build will take 15-20 minutes. Subsequent builds are usually faster (5-10 minutes).

### Step 5: Download Your APK

Once the build completes:

1. The CLI will provide a download link in the terminal
2. You can also visit https://expo.dev/accounts/[your-username]/projects/literacy-game-mobile/builds
3. Download the APK file from the provided link

### Step 6: Install on Your Phone

**Method 1: Direct Download**
- Send the download link to your phone
- Open it in a browser and download the APK
- Install it (you may need to enable "Install from Unknown Sources" in your Android settings)

**Method 2: USB Transfer**
- Download the APK to your computer
- Connect your phone via USB
- Copy the APK file to your phone
- Use a file manager app to locate and install it

## Build Profiles Explained

### Preview Build
- **Purpose:** Testing and sharing with team members
- **Type:** APK file (easy to install)
- **Command:** `eas build --platform android --profile preview`

### Production Build
- **Purpose:** Final release version
- **Type:** APK or AAB (for Google Play Store)
- **Command:** `eas build --platform android --profile production`

### Development Build
- **Purpose:** For development with native modules
- **Type:** Development client
- **Command:** `eas build --platform android --profile development`

## Local Build (Alternative Method)

If you want to build locally without using EAS cloud services:

### Prerequisites for Local Build:
- Android Studio installed
- Java Development Kit (JDK) installed
- Android SDK configured

### Steps:
1. Install EAS CLI: `npm install -g eas-cli`
2. Run local build: `eas build --platform android --profile preview --local`

**Note:** Local builds require significant setup and disk space. Cloud builds are recommended for most users.

## Troubleshooting

### "Not logged in"
Run `eas login` and enter your credentials.

### Build fails
- Check that all dependencies in `package.json` are compatible
- Ensure your Expo SDK version is up to date
- Review the build logs on expo.dev for specific errors

### APK won't install on phone
- Enable "Install from Unknown Sources" in Android Settings > Security
- Make sure the APK downloaded completely (check file size)

### App crashes on launch
- Check that your backend server URL in `config.js` is accessible from your phone
- Ensure all required permissions are listed in `app.json`

## Updating Your App

To create a new version:

1. Update the version in `app.json`:
   ```json
   "version": "1.0.1"
   ```

2. Run the build command again:
   ```bash
   eas build --platform android --profile preview
   ```

3. Download and install the new APK

## Additional Resources

- **EAS Build Documentation:** https://docs.expo.dev/build/introduction/
- **Expo Account Dashboard:** https://expo.dev/accounts
- **App.json Configuration:** https://docs.expo.dev/versions/latest/config/app/

## Quick Reference Commands

```bash
# Login to Expo
eas login

# Build preview APK (recommended for testing)
eas build --platform android --profile preview

# Build production APK
eas build --platform android --profile production

# Check build status
eas build:list

# View build details
eas build:view [build-id]
```

## Cost

- EAS Build offers a free tier with limited builds per month
- Free tier is usually sufficient for small projects and testing
- Check https://expo.dev/pricing for current limits
