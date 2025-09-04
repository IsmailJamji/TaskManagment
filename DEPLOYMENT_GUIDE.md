# 🚀 TaskForge Deployment Guide

## **Quick Setup (5 minutes)**

### **1. Database Setup (Neon)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project: "TaskForge"
4. Copy the connection string (looks like: `postgresql://user:pass@host/db`)

### **2. Backend Deployment (Render)**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name**: `taskforge-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty
6. Add Environment Variables:
   ```
   DATABASE_URL=your-neon-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=production
   PORT=3001
   ```
7. Click "Create Web Service"

### **3. Frontend Deployment (Vercel)**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repo
5. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave empty)
6. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
7. Click "Deploy"

### **4. Test Your App**
1. Get your Vercel URL (e.g., `https://taskforge-abc123.vercel.app`)
2. Open the URL in browser
3. Login with: `admin@taskforge.com` / `admin123`
4. Share the URL with anyone!

## **Default Login Credentials**
- **Email**: `admin@taskforge.com`
- **Password**: `admin123`

## **Features Available**
- ✅ User Management (Create, Edit, Delete users)
- ✅ Task Management (Create, Assign, Track tasks)
- ✅ Search & Filters (Users and Tasks)
- ✅ Department Management
- ✅ Task Comments/Feedback
- ✅ Language Support (English/French)
- ✅ Responsive Design

## **Troubleshooting**
- If backend fails: Check Render logs
- If frontend fails: Check Vercel logs
- If database fails: Check Neon connection string
- If login fails: Check JWT_SECRET is set

## **Cost**
- **Neon**: Free (500MB storage, 1GB transfer)
- **Render**: Free (750 hours/month)
- **Vercel**: Free (100GB bandwidth/month)
- **Total**: $0/month for small to medium usage
