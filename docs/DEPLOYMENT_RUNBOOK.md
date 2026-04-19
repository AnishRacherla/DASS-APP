# DASS-APP Deployment Runbook (Render + Vercel + Android APK)

This runbook gives a reliable order for deploying:
1. Backend to Render
2. Frontend to Vercel
3. Mobile APK with deployed backend URL

## 0) Critical Pre-Deploy Check

Your repository currently contains unresolved merge markers (`<<<<<<<`, `=======`, `>>>>>>>`) in multiple files. Build/deploy will fail until those are resolved.

Quick check command:

```powershell
git grep -n "^<<<<<<<\|^=======\|^>>>>>>>"
```

You must resolve these before deploying.

## 1) Backend Deploy on Render

Service settings:
- Runtime: Node
- Root Directory: backend
- Build Command: npm install
- Start Command: npm start

Environment variables (Render -> Environment):
- MONGODB_URI = <your mongo atlas uri>
- PORT = 5001
- NODE_ENV = production

After deploy, test:

```text
https://YOUR_BACKEND_NAME.onrender.com/api/test
```

Expected response:

```json
{"message":"API is working!"}
```

## 2) Frontend Deploy on Vercel

Project settings:
- Framework: Create React App
- Root Directory: frontend
- Build Command: npm run build
- Output Directory: build

Environment variables (Vercel -> Settings -> Environment Variables):
- REACT_APP_API_BASE = https://YOUR_BACKEND_NAME.onrender.com
- REACT_APP_API_URL = https://YOUR_BACKEND_NAME.onrender.com

Important:
- Many components in this codebase still use hardcoded localhost URLs.
- Replace hardcoded `http://localhost:5001` calls with environment-based values before production.

Local verification before pushing:

```powershell
cd frontend
$env:REACT_APP_API_BASE="https://YOUR_BACKEND_NAME.onrender.com"
$env:REACT_APP_API_URL="https://YOUR_BACKEND_NAME.onrender.com"
npm install
npm run build
```

If local build passes, push and redeploy Vercel.

## 3) Mobile APK Build (Expo EAS)

Use deployed backend in mobile app through env var:
- EXPO_PUBLIC_API_BASE_URL = https://YOUR_BACKEND_NAME.onrender.com

Build commands:

```powershell
cd mobile
npm install
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

For production profile:

```powershell
eas build --platform android --profile production
```

Download APK from Expo build link after success.

## 4) Recommended Release Order

1. Resolve merge markers
2. Deploy backend on Render and confirm /api/test
3. Update frontend env vars and deploy on Vercel
4. Build mobile APK with EXPO_PUBLIC_API_BASE_URL set to Render URL
5. Install APK and test login, quiz fetch, score submit, and audio playback

## 5) Smoke Test Checklist

Backend:
- GET /api/test returns success
- Main game endpoints return data

Frontend:
- Registration/login works
- Quiz loads from backend
- Results/score submit works

Mobile APK:
- App opens without crash
- Login works with deployed backend
- Quiz and audio work on real device

## 6) Optional CLI Deploy Commands

Vercel CLI (from frontend folder):

```powershell
npm install -g vercel
cd frontend
vercel
vercel --prod
```

Render is typically easier from dashboard for monorepo root-directory setup.
