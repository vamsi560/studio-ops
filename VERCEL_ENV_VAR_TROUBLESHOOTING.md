# Troubleshooting: GOOGLE_GENAI_API_KEY Not Found

If you're getting "API Key not found" errors even though you've set the environment variable in Vercel, follow these steps:

## Step 1: Verify Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Look for `GOOGLE_GENAI_API_KEY`
5. Verify:
   - ✅ Name is exactly `GOOGLE_GENAI_API_KEY` (case-sensitive, no spaces)
   - ✅ Value is not empty
   - ✅ Checked for **Production**, **Preview**, and **Development** environments
   - ✅ No extra spaces before/after the key or value

## Step 2: Test the Environment Variable

After deployment, visit:
```
https://your-app.vercel.app/api/test-api-key
```

This endpoint will show:
- Whether the API key is set
- The length of the API key (without exposing it)
- All relevant environment variables found

**Expected response:**
```json
{
  "apiKeyStatus": {
    "isSet": true,
    "length": 39,
    "preview": "AIzaSyD...xyz",
    ...
  },
  "message": "✅ GOOGLE_GENAI_API_KEY is set..."
}
```

If `isSet` is `false`, the variable is not accessible at runtime.

## Step 3: Redeploy After Setting Environment Variable

⚠️ **CRITICAL:** After adding or updating an environment variable in Vercel, you **MUST** trigger a new deployment:

### Option A: Redeploy via Dashboard
1. Go to **Deployments** tab
2. Click the "⋯" menu on the latest deployment
3. Select **Redeploy**
4. Make sure **"Use existing Build Cache"** is **UNCHECKED** (to ensure env vars are reloaded)

### Option B: Push a New Commit
1. Make a small change (like adding a space in README.md)
2. Commit and push:
   ```bash
   git commit --allow-empty -m "Trigger redeploy for env vars"
   git push
   ```

### Option C: Use Vercel CLI
```bash
vercel --prod
```

## Step 4: Common Issues and Solutions

### Issue 1: "API Key not found" but test endpoint shows it's set
**Solution:** The API key might be invalid or revoked. Get a new one from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Issue 2: Test endpoint shows `isSet: false`
**Possible causes:**
- Environment variable not set correctly in Vercel
- Deployment happened before env var was added
- Wrong environment selected in Vercel (e.g., set for Preview but not Production)

**Solution:**
1. Double-check the variable name in Vercel (must be exactly `GOOGLE_GENAI_API_KEY`)
2. Verify all environments are selected
3. Delete and re-add the variable
4. Redeploy (see Step 3)

### Issue 3: Variable works locally but not in Vercel
**Solution:**
- Local `.env.local` file doesn't apply to Vercel
- You must set it in Vercel Dashboard
- Ensure you redeploy after adding

### Issue 4: Error persists after redeploy
**Try these:**
1. Delete the environment variable completely in Vercel
2. Wait 30 seconds
3. Add it again with a fresh value
4. Redeploy (with cache disabled)
5. Wait 2-3 minutes for deployment to complete
6. Test again at `/api/test-api-key`

## Step 5: Verify API Key is Valid

1. Get your API key from Vercel (copy the value)
2. Test it directly with curl:
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}'
   ```
3. If this fails, your API key is invalid/revoked - get a new one

## Step 6: Check Build Logs

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Check the **Build Logs** for any errors
4. Look for messages starting with `[Genkit Config]`

## Still Not Working?

If none of the above works:

1. **Double-check variable name:** It must be exactly `GOOGLE_GENAI_API_KEY` (no typos, correct case)
2. **Check for duplicate variables:** Make sure there aren't multiple entries with slightly different names
3. **Try a different variable name temporarily:** Create `TEST_API_KEY` to verify env vars work at all
4. **Contact Vercel Support:** If the test endpoint shows the variable exists but Genkit can't read it

## Quick Checklist

- [ ] Variable name is exactly `GOOGLE_GENAI_API_KEY`
- [ ] Variable value is not empty
- [ ] Variable is set for Production (and Preview/Development if needed)
- [ ] Redeployed after adding/updating the variable
- [ ] Redeploy was done with cache disabled (or new commit)
- [ ] Tested at `/api/test-api-key` and shows `isSet: true`
- [ ] API key is valid (not revoked/expired)
- [ ] Waited for deployment to fully complete

