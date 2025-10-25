# 🚀 Frontend Deployment Guide

## Prerequisites

1. **GitHub Repository**: Push your frontend code to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Backend Deployed**: Ensure your backend is deployed first

## Step 1: Push to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Frontend ready for deployment"

# Add remote origin (replace with your GitHub repository URL)
git remote add origin https://github.com/OneebDev/Rent-a-car-Frontend.git

# Push to main branch
git push -u origin main
```

## Step 2: Deploy on Vercel

### 2.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `OneebDev/Rent-a-car-Frontend`

### 2.2 Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.3 Environment Variables
Add the following environment variable:

```
VITE_API_BASE_URL=https://your-backend-domain.vercel.app
```

**Replace `your-backend-domain` with your actual backend Vercel domain.**

### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your frontend will be available at: `https://your-frontend-domain.vercel.app`

## Step 3: Update Backend URL

After deployment, update the environment variable in Vercel:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Update `VITE_API_BASE_URL` with your actual backend URL
4. Redeploy if necessary

## Step 4: Test Deployment

### 4.1 Test Frontend
1. Visit your frontend URL
2. Check if all pages load correctly
3. Test the booking form
4. Test contact form
5. Test corporate enquiry form

### 4.2 Test API Integration
1. Fill out a booking form
2. Check if email notifications are received
3. Check browser console for any errors

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check if all dependencies are installed
   - Verify TypeScript configuration
   - Check for missing imports

2. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` is correct
   - Check if backend is deployed and accessible
   - Test backend endpoints directly

3. **Environment Variables**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding new variables
   - Check variable names (case-sensitive)

### Debug Steps

1. **Check Build Logs**
   - Go to Vercel dashboard
   - Click on your deployment
   - Check "Functions" tab for errors

2. **Test API Endpoints**
   ```bash
   curl https://your-backend-domain.vercel.app/api/test-email
   ```

3. **Check Browser Console**
   - Open browser developer tools
   - Check for JavaScript errors
   - Verify API calls in Network tab

## 📱 Mobile Testing

1. **Test on Mobile Devices**
   - Use browser developer tools
   - Test on actual mobile devices
   - Check responsive design

2. **Performance**
   - Test loading speed
   - Check image optimization
   - Verify animations work smoothly

## 🔄 Continuous Deployment

- **Automatic Deployments**: Every push to main branch triggers deployment
- **Preview Deployments**: Pull requests get preview deployments
- **Manual Deployments**: Can be triggered from Vercel dashboard

## 📊 Monitoring

1. **Analytics**: Available in Vercel dashboard
2. **Performance**: Monitor Core Web Vitals
3. **Errors**: Check function logs for API errors

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Frontend accessible
- [ ] API integration working
- [ ] Forms submitting successfully
- [ ] Email notifications received
- [ ] Mobile responsive
- [ ] Performance optimized

## 🎉 Success!

Your frontend is now deployed and ready for production use!
