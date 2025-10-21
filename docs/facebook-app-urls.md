# Facebook App Configuration URLs

## 📋 URLs to Add to Facebook App Settings

After deploying your app, add these URLs to your Facebook App Dashboard:

---

## Settings → Basic

### 1. **Privacy Policy URL** ✅
```
https://asm-frontend-omega.vercel.app/privacy-policy
```

### 2. **Terms of Service URL** ✅
```
https://asm-frontend-omega.vercel.app/terms
```

### 3. **Data Deletion Instructions URL** ✅
```
https://asm-frontend-omega.vercel.app/data-deletion
```

### 4. **App Domains**
```
asm-frontend-omega.vercel.app
```
*(Do NOT include https:// here, just the domain)*

### 5. **Site URL**
```
https://asm-frontend-omega.vercel.app
```

---

## Facebook Login → Settings

### **Valid OAuth Redirect URIs**
Add these URLs (one per line):
```
https://asm-frontend-omega.vercel.app/auth/callback
https://asm-frontend-omega.vercel.app/settings
http://localhost:3000/auth/callback
http://localhost:3000/settings
```

*(Add your backend URLs too if using backend OAuth)*

---

## ✅ Complete Setup Checklist

### Step 1: Deploy Your App
- [ ] Commit and push the new pages to GitHub
- [ ] Vercel will auto-deploy
- [ ] Verify pages are accessible:
  - https://asm-frontend-omega.vercel.app/privacy-policy
  - https://asm-frontend-omega.vercel.app/terms
  - https://asm-frontend-omega.vercel.app/data-deletion

### Step 2: Configure Facebook App
- [ ] Go to https://developers.facebook.com/apps
- [ ] Select your app
- [ ] **Settings → Basic**
  - [ ] Add Privacy Policy URL
  - [ ] Add Terms of Service URL
  - [ ] Add Data Deletion Instructions URL
  - [ ] Add App Domains
  - [ ] Add Site URL
  - [ ] Click **Save Changes**
- [ ] **Facebook Login → Settings**
  - [ ] Add all Valid OAuth Redirect URIs
  - [ ] Enable "Client OAuth Login"
  - [ ] Enable "Web OAuth Login"
  - [ ] Click **Save Changes**

### Step 3: Test
- [ ] Try connecting Facebook account in your app
- [ ] Should no longer see "Can't Load URL" error
- [ ] OAuth flow should work correctly

---

## 🎨 Page Preview

You've created 3 new pages:

1. **Privacy Policy** (`/privacy-policy`)
   - Explains data collection and usage
   - Complies with GDPR and Facebook Platform Policy
   - Details Facebook/Instagram data handling

2. **Terms of Service** (`/terms`)
   - User agreement and acceptable use
   - Service description and limitations
   - Legal disclaimers

3. **Data Deletion Instructions** (`/data-deletion`)
   - Step-by-step deletion instructions
   - Multiple deletion options (account, social connections, email)
   - Facebook-specific revocation steps
   - 30-day deletion timeline

---

## 📝 Before Deploying - Update Email Addresses

**IMPORTANT:** Replace placeholder emails in all 3 pages:

Search for and replace:
- `support@yourdomain.com` → Your actual support email
- `privacy@yourdomain.com` → Your actual privacy email
- `legal@yourdomain.com` → Your actual legal email

---

## 🚀 Deploy Command

```bash
git add .
git commit -m "Add privacy policy, terms, and data deletion pages"
git push
```

Vercel will automatically deploy these pages.

---

## 🔍 Verify Deployment

After deployment, check these URLs are working:
1. https://asm-frontend-omega.vercel.app/privacy-policy
2. https://asm-frontend-omega.vercel.app/terms
3. https://asm-frontend-omega.vercel.app/data-deletion

Then add them to Facebook App Settings.

---

**Last Updated:** October 2025
