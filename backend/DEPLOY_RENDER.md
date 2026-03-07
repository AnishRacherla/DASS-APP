# Deploy Backend to Render (Free)

## Step 1: Prepare Your Backend

Your backend is already configured! But let's make sure everything is ready.

### Check server.js is correct:
The last line should be:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
```
✅ Already correct in your project!

---

## Step 2: Create a Render Account

1. Go to: **https://render.com/**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest) or email
4. Verify your email if needed

---

## Step 3: Deploy Your Backend

### Option A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub** (if not already there):
   ```powershell
   cd "C:\Users\Anish\OneDrive\Desktop\dass proj app\project-monorepo-team-51"
   git add .
   git commit -m "Prepare backend for deployment"
   git push
   ```

2. **On Render Dashboard:**
   - Click **"New +"** → **"Web Service"**
   - Click **"Connect GitHub"** and authorize Render
   - Select your repository: `project-monorepo-team-51`
   - Click **"Connect"**

3. **Configure the Service:**
   - **Name:** `literacy-game-backend` (or any name)
   - **Region:** Select closest to you
   - **Branch:** `main` (or `master`)
   - **Root Directory:** `backend` ⚠️ IMPORTANT!
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

4. **Add Environment Variables:**
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add these:
   ```
   Key: MONGODB_URI
   Value: mongodb+srv://Dass_Project:Yslkph76a1WqyZ3Q@cluster0.q5vdpuv.mongodb.net/Dass_Project?appName=Cluster0
   
   Key: PORT
   Value: 5001
   ```

5. **Click "Create Web Service"**

6. **Wait 2-5 minutes** for deployment to complete

7. **Your backend URL will be:** `https://literacy-game-backend.onrender.com`
   (or whatever name you chose)

---

### Option B: Deploy via Git URL (Alternative)

If you don't want to connect GitHub:

1. On Render Dashboard:
   - Click **"New +"** → **"Web Service"**
   - Select **"Public Git Repository"**
   - Enter your repo URL

2. Follow the same configuration steps as Option A

---

## Step 4: Test Your Deployment

Once deployed, test it:

1. **Open in browser:** `https://your-app.onrender.com/api/test`
2. You should see: `{"message": "API is working!"}`

**Note:** First request may be slow (20-30 seconds) on free tier because the server "sleeps" after inactivity.

---

## Step 5: Update Mobile App Config

Once deployed, update your mobile app:

1. **Open:** `mobile/src/config.js`

2. **Change to:**
   ```javascript
   export const API_BASE_URL = 'https://your-app.onrender.com';
   ```
   (Replace with YOUR actual Render URL)

3. **Rebuild APK:**
   ```powershell
   cd mobile
   eas build --platform android --profile preview
   ```

4. **Done!** Your app now works anywhere! 🎉

---

## Troubleshooting

### "Service Unavailable" or slow response
- First request after 15 minutes of inactivity takes 20-30 seconds (free tier limitation)
- Subsequent requests are fast

### Build fails on Render
- Check you set **Root Directory** to `backend`
- Verify environment variables are correct
- Check build logs on Render dashboard

### Database connection fails
- Verify `MONGODB_URI` is correct in Render environment variables
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

## Important Notes

### Free Tier Limitations:
- ✅ Good for testing and small projects
- ✅ 750 hours/month (enough for always-on)
- ⚠️ Server sleeps after 15 min inactivity
- ⚠️ First request after sleep is slow (20-30s)
- ⚠️ Monthly data transfer limits

### For Production:
Consider upgrading to paid tier ($7/month) for:
- No sleep mode
- Better performance
- More reliability

---

## Quick Checklist

- [ ] Created Render account
- [ ] Connected GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Added MONGODB_URI environment variable
- [ ] Added PORT environment variable
- [ ] Deployment completed successfully
- [ ] Tested `/api/test` endpoint in browser
- [ ] Updated `mobile/src/config.js` with Render URL
- [ ] Rebuilt mobile APK
- [ ] Installed new APK on phone
- [ ] App works! 🎉

---

## Alternative Free Options

If Render doesn't work for any reason:

### Railway (https://railway.app)
- Also free tier available
- Similar deployment process
- Good Node.js support

### Fly.io (https://fly.io)
- Free tier with credit card
- More complex setup
- Better for advanced users

---

## Your Current Setup

**Backend Port:** 5001  
**MongoDB:** Already on MongoDB Atlas (cloud)  
**Database Name:** Dass_Project  
**Assets:** Images and audio files included  

Everything is ready to deploy!
