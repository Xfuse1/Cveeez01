# Vercel Deployment Guide for Cveeez01

## 🚀 Quick Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push Your Code to GitHub**
   ```powershell
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel**
   - Visit [https://vercel.com](https://vercel.com)
   - Click "Sign Up" or "Log In" with your GitHub account

3. **Import Your Project**
   - Click "Add New..." → "Project"
   - Select your GitHub repository: `Xfuse1/Cveeez01`
   - Click "Import"

4. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

5. **Add Environment Variables** (IMPORTANT!)
   Click "Environment Variables" and add these one by one:

   ```
   GEMINI_API_KEY=AIzaSyCJqdlnXQo1H7J-2NQoXEiW_Y1Hx8hCjDI
   
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZTOuBhLrZhJNxBpfmsFnCqLNoS-pyRTo
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-6474248261-7d604.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-6474248261-7d604
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-6474248261-7d604.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1059486690861
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1059486690861:web:83d4f329b772447508d2a4
   
   NEXT_PUBLIC_KASHIER_MERCHANT_ID=MID-31202-773
   NEXT_PUBLIC_KASHIER_API_KEY=6c40bda8-dad9-4f88-aec2-b77fc23e9dac
   KASHIER_SECRET_KEY=da7b28cf36566e8bf9e9b29472bf3139$993989d7fe6e174443e48b30c83e8096434d9d03b7516ca3e6b6ff08346e346f771b268e5386fcfea790cc76ee61c928
   NEXT_PUBLIC_KASHIER_CURRENCY=EGP
   NEXT_PUBLIC_KASHIER_MODE=live
   NEXT_PUBLIC_KASHIER_BASE_URL=https://payments.kashier.io
   
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dr5waimt0
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=Cveeez
   CLOUDINARY_API_KEY=914868945134398
   CLOUDINARY_API_SECRET=s4_IEJKTE5WrcHDWcpDcQrLB2VQs4_IEJKTE5WrcHDWcpDcQrLB2VQ
   ```

   ⚠️ **IMPORTANT**: For each environment variable:
   - Select "All" (Production, Preview, Development)
   - Or at minimum select "Production"

6. **Update NEXT_PUBLIC_APP_URL**
   After deployment, you'll get a URL like `https://cveeez01.vercel.app`
   - Go back to Environment Variables
   - Add: `NEXT_PUBLIC_APP_URL=https://your-actual-deployment-url.vercel.app`
   - Redeploy the project

7. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for deployment to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```powershell
   vercel login
   ```

3. **Deploy**
   ```powershell
   vercel
   ```
   - Follow the prompts
   - Link to existing project or create new one
   - Set production deployment: `vercel --prod`

## 📋 Post-Deployment Checklist

### 1. Update Firebase Configuration
After deployment, update your Firebase project:

**Firebase Console** → **Authentication** → **Authorized Domains**
- Add your Vercel domain: `your-project.vercel.app`

**Firebase Console** → **Settings** → **Authorized domains**
- Add: `your-project.vercel.app`
- Add: `your-project-*.vercel.app` (for preview deployments)

### 2. Update Kashier Webhook URL
**Kashier Dashboard** → **Webhooks**
- Update callback URL to: `https://your-project.vercel.app/api/kashier/webhook`

### 3. Update Cloudinary Settings
**Cloudinary Console** → **Settings** → **Security**
- Add allowed domains:
  - `your-project.vercel.app`
  - `*.vercel.app`

### 4. Test Your Deployment
Visit your deployed site and test:
- ✅ User authentication (sign up/login)
- ✅ Firebase data loading
- ✅ Payment processing
- ✅ Image uploads (Cloudinary)
- ✅ All dashboard features

## 🔧 Troubleshooting

### Build Errors

**Issue**: Build fails with TypeScript errors
```powershell
# Run locally to check
npm run typecheck
npm run build
```

**Issue**: Missing environment variables
- Check Vercel Dashboard → Project Settings → Environment Variables
- Make sure all variables are set for "Production"

### Runtime Errors

**Issue**: Firebase "Invalid API key"
- Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Check Firebase Console → Project Settings

**Issue**: Payment not working
- Update `NEXT_PUBLIC_APP_URL` with your Vercel URL
- Update Kashier webhook URL

**Issue**: Images not uploading
- Check Cloudinary environment variables
- Verify upload preset exists in Cloudinary

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull Requests** → Preview deployment

To trigger a new deployment:
```powershell
git add .
git commit -m "Update feature"
git push origin main
```

## 🎛️ Vercel Dashboard Features

### Project Settings
- **Environment Variables**: Add/edit secrets
- **Domains**: Add custom domain
- **Analytics**: View traffic and performance
- **Logs**: Debug runtime issues

### Deployment
- **Deployments**: View all deployments
- **Functions**: View serverless function logs
- **Edge Network**: Global CDN status

## 📊 Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Edge caching
- ✅ Compression (gzip/brotli)

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore` ✅
2. **Use Vercel environment variables** for all secrets ✅
3. **Enable Firebase App Check** (optional but recommended)
4. **Set up CORS properly** for API routes
5. **Use HTTPS only** (Vercel does this automatically) ✅

## 📝 Custom Domain (Optional)

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. **Add to Vercel**:
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add your domain: `yourdomain.com`
3. **Update DNS**:
   - Add A record: `76.76.21.21`
   - Or CNAME: `cname.vercel-dns.com`
4. **Update environment variables**:
   - Change `NEXT_PUBLIC_APP_URL` to your custom domain
5. **Update Firebase/Kashier**:
   - Add custom domain to authorized domains

## 🎉 You're Live!

Your site will be available at:
- Production: `https://your-project.vercel.app`
- Custom domain: `https://yourdomain.com` (if configured)

## 📞 Support

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Support**: [https://vercel.com/support](https://vercel.com/support)

---

## Quick Commands Reference

```powershell
# Test build locally
npm run build
npm run start

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Pull environment variables from Vercel
vercel env pull
```

Good luck with your deployment! 🚀
