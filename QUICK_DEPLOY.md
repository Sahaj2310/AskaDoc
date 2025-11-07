# Quick Deployment Guide - AskaDoc to Vercel

## 🚀 Quick Steps

### Step 1: Deploy Backend (Choose One)

#### Option A: Railway (Easiest - Recommended)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your AskaDoc repository
5. Railway auto-detects `server` folder
6. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_random_secret_key
   CLIENT_URL=https://your-vercel-app.vercel.app (add after frontend deploy)
   ```
7. Copy the Railway URL (e.g., `https://askadoc-production.up.railway.app`)

#### Option B: Render
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add same environment variables as above

---

### Step 2: Deploy Frontend to Vercel

#### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign up/Login with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import `Sahaj2310/AskaDoc` repository

3. **Configure Project Settings**
   - **Framework Preset**: Create React App
   - **Root Directory**: `client` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `build` (auto-detected)

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: Your backend URL from Step 1 (e.g., `https://askadoc-production.up.railway.app`)
   - Select all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live at: `https://askadoc-xxx.vercel.app`

#### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# When prompted:
# - Set root directory: client
# - Add environment variable: REACT_APP_API_URL
```

---

### Step 3: Update Backend CORS

After frontend is deployed, update backend:

1. Go to Railway/Render dashboard
2. Add/Update environment variable:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
3. Restart the service

---

### Step 4: Test Deployment

1. Visit your Vercel URL
2. Try registering a new user
3. Check browser console for errors
4. Test API: Visit `https://your-backend-url/api/users/stats`

---

## 📋 Environment Variables Checklist

### Frontend (Vercel)
- ✅ `REACT_APP_API_URL` = `https://your-backend-url.railway.app`

### Backend (Railway/Render)
- ✅ `MONGODB_URI` = `mongodb+srv://...`
- ✅ `JWT_SECRET` = `your-secret-key`
- ✅ `CLIENT_URL` = `https://your-vercel-app.vercel.app`
- ✅ `PORT` = `5000` (optional, auto-set)

---

## 🎯 Your URLs After Deployment

- **Frontend**: `https://askadoc-xxx.vercel.app`
- **Backend**: `https://askadoc-production.up.railway.app`

---

## ⚠️ Common Issues

1. **Build fails**: Check Node.js version (needs 14+)
2. **API errors**: Verify `REACT_APP_API_URL` is correct
3. **CORS errors**: Update `CLIENT_URL` in backend
4. **Database errors**: Check MongoDB connection string

---

## 📚 Full Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

