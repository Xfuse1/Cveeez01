# 🚀 Automatic Deployment to Vercel - Setup Guide

This guide shows you how to enable **automatic deployments** so that every time you push code to GitHub, Vercel automatically deploys your changes.

## ✨ How Auto-Deploy Works

Once set up:
- **Push to `main` branch** → Automatic production deployment
- **Push to other branches** → Automatic preview deployment
- **Create Pull Request** → Automatic preview deployment with unique URL

## 📋 Step-by-Step Setup

### Step 1: Connect GitHub Repository to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Click "Log In" 
   - Select "Continue with GitHub"

2. **Import Your Repository**
   - Click "Add New..." button in the top right
   - Select "Project"
   - Find your repository: `Xfuse1/Cveeez01`
   - Click "Import"

3. **Grant Vercel Access** (if prompted)
   - Vercel will ask for permissions to access your repository
   - Click "Install" or "Authorize"
   - This enables automatic deployments

### Step 2: Configure Project Settings

On the import screen:

1. **Project Name**: `cveeez01` (or your preferred name)

2. **Framework Preset**: Next.js (auto-detected ✅)

3. **Root Directory**: `./` (leave as default)

4. **Build & Development Settings**:
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅
   - Install Command: `npm install` ✅

### Step 3: Add Environment Variables

⚠️ **CRITICAL**: Add all environment variables before deploying

Click "Environment Variables" and add these:

```env
# Gemini AI
GEMINI_API_KEY=AIzaSyCJqdlnXQo1H7J-2NQoXEiW_Y1Hx8hCjDI

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBZTOuBhLrZhJNxBpfmsFnCqLNoS-pyRTo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-6474248261-7d604.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-6474248261-7d604
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-6474248261-7d604.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1059486690861
NEXT_PUBLIC_FIREBASE_APP_ID=1:1059486690861:web:83d4f329b772447508d2a4

# Kashier Payment Gateway
NEXT_PUBLIC_KASHIER_MERCHANT_ID=MID-31202-773
NEXT_PUBLIC_KASHIER_API_KEY=6c40bda8-dad9-4f88-aec2-b77fc23e9dac
KASHIER_SECRET_KEY=da7b28cf36566e8bf9e9b29472bf3139$993989d7fe6e174443e48b30c83e8096434d9d03b7516ca3e6b6ff08346e346f771b268e5386fcfea790cc76ee61c928
NEXT_PUBLIC_KASHIER_CURRENCY=EGP
NEXT_PUBLIC_KASHIER_MODE=live
NEXT_PUBLIC_KASHIER_BASE_URL=https://payments.kashier.io

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dr5waimt0
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=Cveeez
CLOUDINARY_API_KEY=914868945134398
CLOUDINARY_API_SECRET=s4_IEJKTE5WrcHDWcpDcQrLB2VQ
```

**For each variable**:
- Paste the key name
- Paste the value
- Select environment: **All** (Production, Preview, Development)
- Click "Add"

### Step 4: Deploy

1. Click the **"Deploy"** button
2. Wait 2-5 minutes for build to complete
3. You'll get a URL like: `https://cveeez01.vercel.app`

### Step 5: Add NEXT_PUBLIC_APP_URL

After first deployment:

1. Copy your Vercel URL (e.g., `https://cveeez01.vercel.app`)
2. Go to: **Settings** → **Environment Variables**
3. Add new variable:
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: `https://cveeez01.vercel.app` (your actual URL)
   - Environment: **All**
4. Click **"Redeploy"** from the Deployments tab

### Step 6: Update External Services

#### Firebase Authorization
1. **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel domain:
   - `cveeez01.vercel.app`
   - `cveeez01-*.vercel.app` (for preview deployments)

#### Kashier Webhook
1. **Kashier Dashboard** → **Webhooks** / **Settings**
2. Update webhook URL:
   - `https://cveeez01.vercel.app/api/kashier/webhook`

#### Cloudinary Domains (Optional)
1. **Cloudinary Console** → **Settings** → **Security**
2. Add allowed domains:
   - `cveeez01.vercel.app`
   - `*.vercel.app`

---

## 🎉 You're Done! Auto-Deploy is Active

### Test It Now:

```powershell
# Make a small change
echo "# Auto-deploy test" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deployment"
git push origin main
```

**What happens next:**
1. GitHub receives your push
2. Vercel detects the change (within seconds)
3. Vercel automatically starts building
4. Your site updates in 2-5 minutes

### Monitor Deployments

**Vercel Dashboard** → **Your Project** → **Deployments**
- See all deployments (production + preview)
- View build logs
- See deployment status
- Get preview URLs

---

## 🔄 Automatic Deployment Behavior

### Production Deployments (main branch)
```powershell
git push origin main
```
→ Deploys to: `https://cveeez01.vercel.app` (production)

### Preview Deployments (other branches)
```powershell
git checkout -b feature/new-feature
git push origin feature/new-feature
```
→ Deploys to: `https://cveeez01-git-feature-new-feature-username.vercel.app`

### Pull Request Deployments
1. Create PR on GitHub
2. Vercel automatically creates preview deployment
3. Vercel bot comments on PR with preview URL
4. Every push to PR branch updates the preview

---

## ⚙️ Deployment Settings (Optional)

### Disable Auto-Deploy for Specific Branches

**Vercel Dashboard** → **Settings** → **Git**
- Ignored Build Step: Add custom logic
- Production Branch: Change from `main` to another branch

### Deployment Protection

**Settings** → **Deployment Protection**
- Enable password protection for preview deployments
- Require Vercel authentication

### Custom Domains

**Settings** → **Domains**
- Add custom domain: `yourdomain.com`
- Vercel provides free SSL certificate
- Auto-deploy will work with custom domain too

---

## 📊 View Deployment Logs

If deployment fails:

1. **Vercel Dashboard** → **Deployments**
2. Click on failed deployment
3. View **Build Logs** tab
4. See exact error message

Common issues:
- Missing environment variables
- TypeScript errors
- Build command fails

---

## 🚀 Quick Commands

```powershell
# Trigger auto-deploy
git add .
git commit -m "Update feature"
git push origin main

# Create feature branch (preview deploy)
git checkout -b feature/test
git push origin feature/test

# View deployment status
# (Visit Vercel dashboard or check GitHub commit status)
```

---

## 🔐 Security Notes

✅ **GitHub Integration is secure**:
- Vercel only has read access to your repository
- Vercel cannot modify your code
- Environment variables are encrypted
- Secret keys never appear in build logs

✅ **Best Practices**:
- Never commit `.env.local` (already in `.gitignore`)
- Use Vercel environment variables for all secrets
- Review deployment logs for sensitive data leaks
- Enable deployment protection for staging branches

---

## 🎯 What You Get with Auto-Deploy

✨ **Automatic Features**:
- ✅ Deploy on every push
- ✅ Preview deployments for PRs
- ✅ Automatic rollback on errors
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Branch previews
- ✅ Instant cache invalidation
- ✅ Build logs and analytics

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Integration**: https://vercel.com/docs/concepts/git/vercel-for-github
- **Support**: https://vercel.com/support

---

## ✅ Checklist

Before you start:
- [ ] GitHub repository exists and is up to date
- [ ] All code is committed and pushed
- [ ] You have a Vercel account
- [ ] Firebase project is configured
- [ ] Kashier account is set up
- [ ] Cloudinary account is ready

After setup:
- [ ] Vercel connected to GitHub ✅
- [ ] Environment variables added ✅
- [ ] First deployment successful ✅
- [ ] NEXT_PUBLIC_APP_URL configured ✅
- [ ] Firebase domains authorized ✅
- [ ] Kashier webhook updated ✅
- [ ] Test deployment works ✅

---

## 🎊 Congratulations!

Your project now has **automatic continuous deployment**! 

Every push to GitHub = Automatic deployment to Vercel 🚀

**Your production URL**: https://cveeez01.vercel.app (or your custom domain)

Happy deploying! 🎉
