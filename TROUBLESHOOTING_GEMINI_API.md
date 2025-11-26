# 🔧 Troubleshooting: Gemini API Key Issues

## ❌ Problem: "Missing required environment variable: GEMINI_API_KEY"

This error occurs when the CV generation service cannot access a valid Gemini API key.

---

## 🎯 Root Causes

### 1. **API Key is Expired** (Most Common)
The Gemini API key has an expiration date. When it expires, you'll see:
```
Error: API key expired. Please renew the API key.
```

### 2. **Missing or Invalid .env File**
The `.env` file doesn't exist or the `GEMINI_API_KEY` variable is not set.

### 3. **Multiple .env Files Conflict**
Having both `.env` and `.env.local` can cause confusion about which key is being used.

### 4. **Environment Variable Not Loaded**
Next.js may not be loading the environment variable correctly during runtime.

---

## ✅ Solutions

### Solution 1: Get a New Gemini API Key (REQUIRED)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the new API key (starts with `AIza...`)
5. Update your `.env` file:

```bash
GEMINI_API_KEY=AIza[your_new_key_here]
```

### Solution 2: Clean Up Environment Files

1. **Delete `.env.local` if it exists:**
   ```bash
   rm .env.local
   # or on Windows:
   del .env.local
   ```

2. **Ensure only `.env` exists with the correct key**

3. **Verify your `.env` file contains:**
   ```bash
   GEMINI_API_KEY=AIzaSy...your_actual_key
   ```

### Solution 3: Test Your API Key

Run the test script to verify your key works:

```bash
node test-gemini.js
```

Expected output:
```
✅ Gemini API is working!
📝 Response: Hello from Gemini!
```

If you see errors:
- ❌ `API key expired` → Get a new key (Solution 1)
- ❌ `API_KEY_INVALID` → Check the key is copied correctly
- ❌ `GEMINI_API_KEY is missing` → Check your .env file

### Solution 4: Restart Your Development Server

After updating the `.env` file:

1. **Stop the server** (Ctrl+C)
2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   # or on Windows:
   rmdir /s /q .next
   ```
3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

### Solution 5: Verify Environment Variable Loading

Add this to any API route temporarily to debug:

```typescript
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length);
console.log('GEMINI_API_KEY starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));
```

---

## 🔍 Quick Diagnostic Checklist

- [ ] I have obtained a **new, valid** Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] The key is in my `.env` file as `GEMINI_API_KEY=AIza...`
- [ ] I have **deleted** `.env.local` to avoid conflicts
- [ ] I have **restarted** the development server after changing `.env`
- [ ] I have **cleared** the `.next` folder
- [ ] The test script (`node test-gemini.js`) passes successfully

---

## 📞 Common Error Messages & Solutions

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `API key expired. Please renew the API key.` | Key is expired | Get new key from Google AI Studio |
| `Missing required environment variable: GEMINI_API_KEY` | .env not loaded or missing | Verify .env file exists and restart server |
| `API_KEY_INVALID` | Key format is wrong | Check key is copied correctly (starts with AIza) |
| `500 Internal Server Error` | Server can't access key | Check server logs, verify .env file |

---

## 🚀 Prevention Tips

1. **Set Calendar Reminder**: Gemini API keys expire periodically. Set a reminder to renew it.
2. **Use .env.example**: Keep a template of required variables in `.env.example`
3. **Add to .gitignore**: Ensure `.env` is in `.gitignore` to avoid committing secrets
4. **Monitor API Usage**: Check your [Google Cloud Console](https://console.cloud.google.com) for API quotas

---

## 📚 Additional Resources

- [Google AI Studio - API Keys](https://makersuite.google.com/app/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## ⚠️ Security Note

**Never commit your API keys to version control!**

- Always use `.env` files (which should be in `.gitignore`)
- Never hardcode keys in source files
- Use environment variables for all sensitive data
- Rotate keys regularly for security
