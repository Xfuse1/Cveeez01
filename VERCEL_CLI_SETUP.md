# 🚀 Vercel Auto-Deploy Setup via Terminal (CLI)

This guide will help you set up automatic deployments to Vercel using only the terminal.

## Prerequisites

- Node.js installed (you already have this ✅)
- GitHub repository pushed (you already have this ✅)
- Vercel account (we'll create/login)

---

## Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

Wait for installation to complete...

---

## Step 2: Login to Vercel

```powershell
vercel login
```

This will:
1. Open your browser
2. Ask you to login with GitHub
3. Confirm the login in terminal

**Alternative email login:**
```powershell
vercel login --email your-email@example.com
```

---

## Step 3: Link Project to Vercel

From your project directory:

```powershell
vercel
```

You'll be asked:

1. **"Set up and deploy?"** → Press `Y` (Yes)
2. **"Which scope?"** → Select your account (press Enter)
3. **"Link to existing project?"** → Press `N` (No - first time)
4. **"What's your project's name?"** → Type: `cveeez01` (or press Enter for default)
5. **"In which directory is your code located?"** → Press Enter (current directory)
6. **"Auto-detected Project Settings (Next.js)"** → Press `Y` (Yes)

This will:
- Create a `.vercel` folder (already in .gitignore)
- Link your local project to Vercel
- Deploy a preview version

**Copy the preview URL** it gives you (e.g., `https://cveeez01-abc123.vercel.app`)

---

## Step 4: Add Environment Variables

You have two options:

### Option A: Add via CLI (one by one)

```powershell
# Gemini AI
vercel env add GEMINI_API_KEY production
# Paste: AIzaSyCJqdlnXQo1H7J-2NQoXEiW_Y1Hx8hCjDI

# Firebase
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Paste: AIzaSyBZTOuBhLrZhJNxBpfmsFnCqLNoS-pyRTo

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# Paste: studio-6474248261-7d604.firebaseapp.com

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
# Paste: studio-6474248261-7d604

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
# Paste: studio-6474248261-7d604.appspot.com

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
# Paste: 1059486690861

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
# Paste: 1:1059486690861:web:83d4f329b772447508d2a4

# Kashier
vercel env add NEXT_PUBLIC_KASHIER_MERCHANT_ID production
# Paste: MID-31202-773

vercel env add NEXT_PUBLIC_KASHIER_API_KEY production
# Paste: 6c40bda8-dad9-4f88-aec2-b77fc23e9dac

vercel env add KASHIER_SECRET_KEY production
# Paste: da7b28cf36566e8bf9e9b29472bf3139$993989d7fe6e174443e48b30c83e8096434d9d03b7516ca3e6b6ff08346e346f771b268e5386fcfea790cc76ee61c928

vercel env add NEXT_PUBLIC_KASHIER_CURRENCY production
# Paste: EGP

vercel env add NEXT_PUBLIC_KASHIER_MODE production
# Paste: live

vercel env add NEXT_PUBLIC_KASHIER_BASE_URL production
# Paste: https://payments.kashier.io

# Cloudinary
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production
# Paste: dr5waimt0

vercel env add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET production
# Paste: Cveeez

vercel env add CLOUDINARY_API_KEY production
# Paste: 914868945134398

vercel env add CLOUDINARY_API_SECRET production
# Paste: s4_IEJKTE5WrcHDWcpDcQrLB2VQ
```

### Option B: Create .env file and import (Faster!)

1. Create a temporary env file:

```powershell
# Create vercel-env.txt
echo "GEMINI_API_KEY=AIzaSyCJqdlnXQo1H7J-2NQoXEiW_Y1Hx8hCjDI
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
CLOUDINARY_API_SECRET=s4_IEJKTE5WrcHDWcpDcQrLB2VQ" | Out-File -FilePath vercel-env.txt -Encoding utf8
```

2. Import all at once:

```powershell
vercel env pull .env.vercel.local
```

Then manually add via dashboard or CLI.

---

## Step 5: Connect to GitHub (Enable Auto-Deploy)

```powershell
vercel git connect
```

This command will:
1. Detect your GitHub repository
2. Install Vercel GitHub App (if needed)
3. Link the project to GitHub
4. **Enable automatic deployments** ✅

You'll see:
```
> Connecting Git remote: https://github.com/Xfuse1/Cveeez01.git
> Connected to GitHub repository Xfuse1/Cveeez01
```

---

## Step 6: Deploy to Production

```powershell
vercel --prod
```

This will:
- Build your project
- Deploy to production
- Give you a production URL: `https://cveeez01.vercel.app`

**Save this URL!** You'll need it for the next step.

---

## Step 7: Add Production URL to Environment

```powershell
# Replace with your actual Vercel URL
vercel env add NEXT_PUBLIC_APP_URL production
# Paste: https://cveeez01.vercel.app
```

Then redeploy:

```powershell
vercel --prod
```

---

## Step 8: Verify Auto-Deploy is Working

```powershell
# Make a test change
echo "# Auto-deploy test" >> README.md

# Commit and push
git add README.md
git commit -m "Test automatic deployment"
git push origin main
```

**Check deployment:**
```powershell
vercel inspect
```

Or visit: https://vercel.com/dashboard

You should see a new deployment triggered automatically! 🎉

---

## 🎯 Useful Vercel CLI Commands

### View all deployments
```powershell
vercel ls
```

### Check deployment status
```powershell
vercel inspect
```

### View logs
```powershell
vercel logs
```

### View environment variables
```powershell
vercel env ls
```

### Pull environment variables locally
```powershell
vercel env pull .env.local
```

### Remove a deployment
```powershell
vercel rm <deployment-url>
```

### View project info
```powershell
vercel project ls
```

### Redeploy production
```powershell
vercel --prod --force
```

---

## 📋 Post-Setup: Update External Services

### Firebase Authorization
```powershell
# Open Firebase Console in browser
start https://console.firebase.google.com/project/studio-6474248261-7d604/authentication/settings
```

Add authorized domains:
- `cveeez01.vercel.app`
- `cveeez01-*.vercel.app`

### Kashier Webhook
Update webhook URL to:
- `https://cveeez01.vercel.app/api/kashier/webhook`

---

## 🔄 How Auto-Deploy Works Now

**After `vercel git connect`:**

1. You push code:
   ```powershell
   git push origin main
   ```

2. GitHub notifies Vercel automatically

3. Vercel builds and deploys (2-5 minutes)

4. Your site updates at: `https://cveeez01.vercel.app`

**No manual commands needed!** Just `git push` 🚀

---

## ✅ Verify Everything Works

```powershell
# Check Vercel connection
vercel whoami

# Check linked project
vercel project ls

# Check environment variables
vercel env ls

# Check latest deployment
vercel ls
```

---

## 🔥 Quick Reference

```powershell
# Login
vercel login

# Link project (first time)
vercel

# Connect to GitHub (enable auto-deploy)
vercel git connect

# Deploy to production
vercel --prod

# Add environment variable
vercel env add VARIABLE_NAME production

# View logs
vercel logs

# View deployments
vercel ls

# Pull env variables
vercel env pull
```

---

## 🎊 You're Done!

Your project now has **automatic continuous deployment**!

**Test it:**
1. Make any code change
2. `git add .`
3. `git commit -m "Test auto-deploy"`
4. `git push origin main`
5. Visit Vercel dashboard and watch it deploy automatically! 🎉

**Production URL:** https://cveeez01.vercel.app

---

## 📞 Troubleshooting

### "Error: Not authenticated"
```powershell
vercel logout
vercel login
```

### "Error: No existing credentials found"
```powershell
vercel link
```

### "Error: Missing environment variables"
```powershell
vercel env ls
vercel env add VARIABLE_NAME production
vercel --prod
```

### Check deployment errors
```powershell
vercel logs
```

---

## 🔐 Security Note

The `.vercel` folder contains project settings but NOT secrets. It's safe to commit if needed, but it's already in `.gitignore`.

---

Happy deploying! 🚀
