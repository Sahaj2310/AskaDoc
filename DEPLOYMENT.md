# Deployment Guide for AskaDoc

This guide will help you deploy AskaDoc to Vercel (Frontend) and a backend hosting service.

## Architecture

- **Frontend**: React app deployed on Vercel
- **Backend**: Node.js/Express API (deploy separately to Railway, Render, or similar)

## Prerequisites

1. GitHub account with your AskaDoc repository
2. Vercel account (free tier available)
3. Backend hosting service account (Railway, Render, or Heroku)
4. MongoDB Atlas account (for cloud database) or your MongoDB connection string

---

## Step 1: Deploy Backend First

### Option A: Deploy to Railway (Recommended)

1. Go to [Railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your AskaDoc repository
4. Railway will detect the server folder automatically
5. Add environment variables:
   - `PORT` = 5000 (or leave default)
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Your secret key (generate a random string)
   - `CLIENT_URL` = Your Vercel frontend URL (add after frontend is deployed)
6. Railway will provide a URL like: `https://your-app.railway.app`
7. Copy this URL - you'll need it for the frontend

### Option B: Deploy to Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: askadoc-backend
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables (same as Railway)
6. Render will provide a URL like: `https://askadoc-backend.onrender.com`

### Option C: Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create askadoc-backend`
4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set CLIENT_URL=https://your-vercel-app.vercel.app
   ```
5. Deploy: `git push heroku master`

---

## Step 2: Deploy Frontend to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository (Sahaj2310/AskaDoc)
   - Vercel will auto-detect it's a React app

3. **Configure Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: `client` (IMPORTANT!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     REACT_APP_API_URL = https://your-backend-url.railway.app
     ```
   - Replace with your actual backend URL from Step 1

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Vercel will provide a URL like: `https://askadoc.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Navigate to project root**
   ```bash
   cd D:\Projects\AskaDoc
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Set root directory to `client` when asked
   - Add environment variable: `REACT_APP_API_URL`

5. **Set Environment Variable**
   ```bash
   vercel env add REACT_APP_API_URL
   ```
   - Enter your backend URL when prompted

---

## Step 3: Update Backend CORS

After deploying frontend, update your backend's `CLIENT_URL` environment variable:

1. Go to your backend hosting service (Railway/Render/Heroku)
2. Update `CLIENT_URL` to your Vercel URL: `https://your-app.vercel.app`
3. Restart the backend service

---

## Step 4: Update MongoDB Connection

If using MongoDB Atlas:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get connection string
4. Update `MONGODB_URI` in backend environment variables
5. Add your backend server IP to MongoDB Atlas IP whitelist (or use 0.0.0.0/0 for all)

---

## Step 5: Verify Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend**: Visit `https://your-backend-url/api/users/stats`
3. **Test Full Flow**: Try registering a new user

---

## Environment Variables Summary

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### Backend (Railway/Render/Heroku)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/askadoc
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=https://your-vercel-app.vercel.app
```

---

## Troubleshooting

### Frontend Issues

1. **Build Fails**
   - Check Node.js version (should be 14+)
   - Check for TypeScript errors
   - Review build logs in Vercel dashboard

2. **API Calls Fail**
   - Verify `REACT_APP_API_URL` is set correctly
   - Check CORS settings on backend
   - Verify backend is running

### Backend Issues

1. **Database Connection Fails**
   - Verify MongoDB URI is correct
   - Check IP whitelist in MongoDB Atlas
   - Verify network access

2. **CORS Errors**
   - Update `CLIENT_URL` in backend environment variables
   - Restart backend service

---

## Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions

---

## Continuous Deployment

Both Vercel and Railway/Render support automatic deployments:
- Push to `master` branch → Auto-deploy
- No manual deployment needed after initial setup

---

## Cost Estimate

- **Vercel**: Free tier (sufficient for most projects)
- **Railway**: Free tier with $5 credit/month
- **Render**: Free tier available
- **MongoDB Atlas**: Free tier (512MB storage)

**Total: FREE** (for small to medium projects)

---

## Support

If you encounter issues:
1. Check deployment logs in Vercel/Railway dashboard
2. Verify all environment variables are set
3. Test backend API endpoints directly
4. Check browser console for frontend errors

