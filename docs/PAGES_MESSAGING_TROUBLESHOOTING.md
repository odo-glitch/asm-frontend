# pages_messaging Troubleshooting Guide

Use this guide to fix common issues before and during the Facebook App Review process.

---

## 🔍 Pre-Submission Issues

### Issue 1: Conversations Not Loading in Inbox

**Symptoms:**
- Inbox shows "No messages found"
- "Facebook needs pages_messaging permission" error
- Conversations list is empty

**Possible Causes & Solutions:**

#### A. Page Not Connected
```
Problem: Facebook Page is not connected to your app
Solution:
1. Go to Settings → Connected Accounts
2. Click "Connect Facebook"
3. Select your Facebook Page
4. Grant all permissions
5. Verify connection successful
```

#### B. No Test Messages Sent
```
Problem: Test Page has no messages
Solution:
1. Open Messenger on mobile or web
2. Go to m.me/[your-test-page-username]
3. Send 2-3 test messages:
   - "Hi, I have a question"
   - "What are your hours?"
   - "Can you help me?"
4. Wait 30 seconds for sync
5. Refresh your app's Inbox
```

#### C. Backend URL Not Set
```
Problem: NEXT_PUBLIC_BACKEND_URL is not configured
Solution:
1. Check your .env.local file
2. Ensure it has:
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
3. For local testing:
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
4. Restart your dev server
```

#### D. Permission Not Yet Approved
```
Problem: pages_messaging permission not yet granted by Facebook
Solution:
- Before approval: You won't see real messages
- Use mock/demo data for video recording if needed
- Or: Request permission to test first (Advanced Access)
- Submit your video using test messages before full approval
```

---

### Issue 2: "Facebook account not found" Error

**Symptoms:**
- API returns 404 error
- Console shows "No Facebook account found"

**Solutions:**

#### Check Database Connection
```sql
-- Run this query in Supabase SQL Editor
SELECT * FROM social_accounts 
WHERE user_id = 'YOUR_USER_ID' 
  AND platform = 'facebook' 
  AND is_active = true;
```

If no results:
1. Reconnect your Facebook account
2. Check that `is_active` is set to `true`
3. Verify `user_id` matches your auth user ID

#### Verify Token Encryption
```javascript
// Check if access_token fields exist
- access_token (encrypted token)
- access_token_iv (initialization vector)
- access_token_tag (authentication tag)
```

If any are null, re-authenticate the Facebook account.

---

### Issue 3: "Can't Send Messages" - Reply Fails

**Symptoms:**
- Click "Send" but message doesn't appear
- Error: "Failed to send message"
- Network error in console

**Solutions:**

#### A. Check Page Admin Status
```
Problem: Test account is not Page admin
Solution:
1. Go to Facebook Page Settings
2. Navigate to Page Roles
3. Ensure your test account is Admin or Editor
4. Admins have full messaging permissions
```

#### B. Verify Access Token
```
Problem: Page access token is expired or invalid
Solution:
1. Disconnect and reconnect Facebook Page
2. Make sure to grant all permissions during connection
3. Check token hasn't expired (tokens last 60 days by default)
4. Consider requesting long-lived tokens
```

#### C. Check API Endpoint
```javascript
// Verify the endpoint in your code:
POST /api/facebook/conversations/:userId/:conversationId/reply

// Required body:
{
  "message": "Your message text"
}
```

---

### Issue 4: Video Recording Problems

**Symptoms:**
- Video file is too large (>250MB)
- Video quality is poor/blurry
- Screen recorder not working

**Solutions:**

#### A. Compress Large Video
```
Tools to compress:
1. HandBrake (free, desktop)
   - Target: 5-10 Mbps bitrate
   - Format: MP4 (H.264)
   
2. Online compressors:
   - freeconvert.com
   - cloudconvert.com
   - videosmaller.com

Settings:
- Resolution: Keep 1080p
- Bitrate: 3-5 Mbps
- Format: MP4
```

#### B. Improve Video Quality
```
Settings for clear recording:
- Resolution: 1920x1080 (1080p)
- Frame rate: 30 fps minimum
- Bitrate: 5000-10000 kbps
- Close other applications (reduce lag)
- Use wired internet (stable connection)
```

#### C. Alternative Screen Recorders
```
Windows:
- OBS Studio (free, professional)
- ScreenRec (free, easy)
- Xbox Game Bar (built-in)

Mac:
- QuickTime Player (built-in)
- ScreenFlow (paid)
- OBS Studio (free)

Web:
- Loom (free tier, easy to use)
- ScreenCastify (Chrome extension)
```

---

## 📋 During Review Issues

### Issue 5: Facebook Reviewer Can't Login

**Symptoms:**
- Review feedback: "Can't access test account"
- Status: "Needs Information"

**Solutions:**

#### A. Check Test Credentials
```
Make sure you provided:
✅ Complete email address
✅ Correct password (no typos)
✅ Working login URL
✅ Clear instructions

Test yourself:
1. Log out of your app
2. Use the exact credentials you provided
3. Verify you can log in successfully
4. Try from incognito/private browser
```

#### B. Account Issues
```
Common problems:
- Two-factor authentication enabled (disable for test account)
- Account locked or suspended
- Password expired or changed
- Account requires additional verification

Solution:
- Use a simple password (no special requirements)
- Disable 2FA for test account
- Keep account active (log in regularly)
```

---

### Issue 6: Reviewer Says "Feature Not Working"

**Symptoms:**
- Review rejected with "Could not reproduce functionality"
- "Inbox is empty" feedback

**Solutions:**

#### A. Ensure Messages Exist
```
Before submission checklist:
1. Log in as reviewer would
2. Navigate to Inbox
3. Verify conversations are visible
4. Verify messages load
5. Try sending a test reply
6. Confirm it works end-to-end

If empty:
1. Send fresh test messages to the Page
2. Use a different Facebook account to send
3. Wait 1-2 minutes for sync
4. Refresh inbox
```

#### B. Provide Better Test Data
```
Create clear test scenario:
1. Name test conversations clearly:
   - "Test Customer 1"
   - "Test Customer 2"
2. Use meaningful messages:
   - "Hello, I need help with [topic]"
   - "What are your business hours?"
3. Have 3-5 conversations ready
4. Include both new and older messages
```

---

### Issue 7: "Privacy Policy Concerns"

**Symptoms:**
- Review feedback mentions privacy policy
- Data handling concerns

**Solutions:**

#### A. Update Privacy Policy
```
Ensure your privacy policy includes:
✅ "We collect Facebook Page data"
✅ "We access Messenger conversations"
✅ "Messages are stored securely"
✅ "Data retention: [X] days"
✅ "How to delete data"
✅ "Compliance with GDPR/CCPA"

Location: /privacy-policy page
Must be publicly accessible
```

#### B. Add Data Deletion
```
Ensure data deletion page includes:
✅ How to disconnect Facebook
✅ How to request data deletion
✅ Timeline for deletion (e.g., 30 days)
✅ Contact information

Location: /data-deletion page
```

---

### Issue 8: "Insufficient Documentation"

**Symptoms:**
- "Provide more details about usage"
- "Video doesn't demonstrate feature clearly"

**Solutions:**

#### A. Expand Description
```
Make sure description includes:
✅ What data is accessed (conversations, messages)
✅ Why it's needed (unified inbox, customer service)
✅ How it adds value (saves time, improves response)
✅ User-initiated interactions only
✅ Compliance with policies
✅ No spam or promotional messages

Use the template from:
PAGES_MESSAGING_APP_REVIEW_GUIDE.md
```

#### B. Improve Video
```
Common video issues:
❌ Too fast (slow down!)
❌ Text not readable (zoom in, use 1080p)
❌ Skipped verification step (must show Facebook!)
❌ Not showing send feature (must send a reply!)
❌ Poor audio (use clear narration or captions)

Re-record with:
✅ Slower pace
✅ Clear text
✅ Complete workflow
✅ Facebook verification
✅ Clear narration
```

---

## 🚨 Emergency Fixes

### Quick Fix: App Crashed During Review

```
1. Check error logs:
   - Frontend: Browser console
   - Backend: Server logs
   - Database: Supabase logs

2. Common crash causes:
   - Null/undefined data
   - API timeout
   - Database connection lost
   - Invalid token

3. Add error handling:
   - Try-catch blocks
   - Fallback to demo data
   - Show user-friendly error messages
   - Log errors for debugging
```

### Quick Fix: Permission Denied Errors

```
1. Check Facebook App Dashboard:
   - App Review → Permissions
   - Verify pages_messaging status
   - Check if temporarily revoked

2. Check token permissions:
   - Reconnect Facebook Page
   - Grant all permissions
   - Verify token includes pages_messaging scope

3. Check backend API:
   - Verify API endpoints working
   - Check token decryption
   - Test with direct API call
```

---

## 🔧 Development Environment Checks

### Pre-Deployment Checklist

```bash
# 1. Environment variables set
✅ NEXT_PUBLIC_BACKEND_URL
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ Facebook App ID
✅ Facebook App Secret (backend)

# 2. Backend API running
✅ Backend server is live
✅ /api/facebook endpoints responding
✅ CORS configured correctly

# 3. Database tables exist
✅ social_accounts table
✅ conversations table (if used)
✅ messages table (if used)

# 4. SSL/HTTPS
✅ Production app uses HTTPS
✅ Valid SSL certificate
✅ No mixed content warnings
```

---

## 📊 Testing Checklist

### Test Before Submission

Run through this checklist yourself:

```
User Flow Test:
□ Can create test account
□ Can log in successfully
□ Can connect Facebook Page
□ Can see page in Connected Accounts
□ Can navigate to Inbox
□ Conversations load (or show appropriate message)
□ Can click on a conversation
□ Messages display correctly
□ Can type in reply box
□ Can send a reply
□ Reply appears in conversation
□ Reply appears in Facebook Messenger
□ Can switch between conversations
□ Can log out

Error Cases:
□ What happens if no Page connected?
□ What happens if no messages?
□ What happens if send fails?
□ Are error messages user-friendly?
```

---

## 🆘 Getting Help

### If Still Stuck

1. **Facebook Developer Support**
   - https://developers.facebook.com/support/
   - Use "App Review" category
   - Provide your App ID

2. **Check Status**
   - App Dashboard → App Review → Requests
   - Read feedback carefully
   - Respond within 7 days if info requested

3. **Community**
   - Facebook Developer Community Forum
   - Stack Overflow (tag: facebook-graph-api)
   - Reddit: r/FacebookDevelopers

4. **Documentation**
   - Messenger Platform Policies: https://developers.facebook.com/docs/messenger-platform/policy
   - App Review: https://developers.facebook.com/docs/app-review
   - pages_messaging: https://developers.facebook.com/docs/permissions/reference/pages_messaging

---

## 📝 Common Review Feedback & Responses

### Feedback: "Can't access the feature"

**Response Template:**
```
Thank you for the feedback. I've verified the test credentials:
- Email: [test email]
- Password: [test password]
- Direct link to Inbox: https://asm-frontend-omega.vercel.app/inbox

The test Page "[Page Name]" has 3 test conversations ready. 
After logging in:
1. Click "Inbox" in the left sidebar
2. Conversations should load automatically
3. Click any conversation to view messages
4. Type a reply and click "Send" to test

I've also attached a new screen recording showing the complete flow.
Please let me know if you need any additional information.
```

### Feedback: "Need more detail on data usage"

**Response Template:**
```
Thank you for the feedback. To clarify our data usage:

DATA ACCESSED:
- Facebook Messenger conversation IDs
- Message text content
- Sender names and IDs
- Message timestamps
- Read/unread status

PURPOSE:
- Display conversations in unified inbox
- Enable businesses to reply to customers
- Maintain conversation history
- Track response metrics (anonymized)

DATA STORAGE:
- Messages cached temporarily for performance
- No permanent storage of message content
- Conversation metadata retained for analytics
- All data encrypted at rest and in transit

COMPLIANCE:
- GDPR compliant with data deletion on request
- No sharing with third parties
- No advertising or marketing use
- Only customer-initiated conversations accessed

I've updated our privacy policy to reflect this detail:
https://asm-frontend-omega.vercel.app/privacy-policy
```

---

## ✅ Success Indicators

You're ready to submit when:

- [ ] You can log in reliably with test credentials
- [ ] Inbox loads conversations every time
- [ ] You can send replies successfully
- [ ] Replies appear in Facebook Messenger
- [ ] Video shows complete workflow (under 5 min)
- [ ] Description is comprehensive (300+ words)
- [ ] Test instructions are step-by-step
- [ ] Privacy policy mentions Facebook data
- [ ] Test account is a real Facebook account
- [ ] Test Page has 3+ conversations

---

**Last Updated**: December 2024

If you encounter issues not covered here, document them and add to this guide for future reference.

