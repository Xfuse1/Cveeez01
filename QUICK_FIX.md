# ⚡ Quick Fix: CV Generation Error

## 🚨 Problem
```
Error: Missing required environment variable: GEMINI_API_KEY
```

## ✅ Solution (3 Steps - Takes 5 minutes)

### Step 1: Get New Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Step 2: Update .env File
Open `.env` file and update:
```bash
GEMINI_API_KEY=AIzaYourNewKeyHere
```

### Step 3: Restart Server
```bash
# Stop server (Ctrl+C)
rm -rf .next     # Clear cache
npm run dev      # Restart
```

## ✅ Done!
Test at: http://localhost:9004/services/ai-cv-builder

---

## 📚 Need More Help?
- Full solution: [SOLUTION_SUMMARY_AR.md](SOLUTION_SUMMARY_AR.md)
- Troubleshooting guide: [TROUBLESHOOTING_GEMINI_API.md](TROUBLESHOOTING_GEMINI_API.md)

---

## ⚠️ Why This Happened
Your Gemini API key expired. Google AI API keys need periodic renewal.

**Prevention**: Set a calendar reminder to renew your API key every few months.
