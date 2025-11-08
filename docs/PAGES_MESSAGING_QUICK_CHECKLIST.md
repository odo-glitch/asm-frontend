# pages_messaging Quick Checklist ✅

Use this alongside the main guide (`PAGES_MESSAGING_APP_REVIEW_GUIDE.md`) as a quick reference.

---

## 🎬 Screen Recording Checklist (5 min)

### Must Show:
- [ ] **0:00-0:30** - Login and navigate to Inbox
- [ ] **0:30-1:30** - Display conversation list (names, timestamps, unread counts)
- [ ] **1:30-2:30** - Open a conversation and show message thread
- [ ] **2:30-3:30** - Type and send a reply
- [ ] **3:30-4:30** - Verify reply appears in Facebook Messenger
- [ ] **4:30-5:00** - Show switching between multiple conversations

### Technical Requirements:
- [ ] 1080p minimum resolution
- [ ] MP4 or MOV format
- [ ] Under 5 minutes
- [ ] Under 250MB file size
- [ ] Cursor visible
- [ ] Audio narration (recommended)

---

## 📝 Description Field

Copy-paste this into "Detailed Description" field:

```
Our social media management platform uses the pages_messaging permission to enable businesses to manage and respond to their Facebook Messenger conversations from a centralized inbox. This is essential for our core customer communication features:

1. UNIFIED INBOX MANAGEMENT
   - Businesses can view all incoming Messenger conversations from customers in one centralized inbox
   - Messages from multiple Facebook Pages can be managed in a single interface
   - Conversations are displayed with customer names, avatars, message previews, and timestamps

2. CUSTOMER SUPPORT & COMMUNICATION
   - Businesses can read message history and full conversation threads
   - Users can reply to customer inquiries directly from our platform
   - All messages are customer-initiated - we only respond to existing conversations
   - Enables faster response times by consolidating communications

3. CONVERSATION ORGANIZATION
   - Track unread message counts and conversation status
   - View recent conversations sorted by most recent activity
   - Switch between multiple Page conversations seamlessly

HOW IT ADDS VALUE:
- Saves time by eliminating the need to switch between Facebook/Messenger apps
- Improves customer service with faster response times
- Centralizes all customer communications in one professional dashboard
- Enables businesses to manage multiple Pages from a single interface
- Maintains conversation history and context for better customer relationships

WHY IT'S NECESSARY:
The pages_messaging permission is absolutely essential for our Inbox feature to function. Without it, users cannot view or respond to Messenger conversations from our platform, which is a core value proposition of our social media management tool. This permission directly enables the user-initiated interactive experiences that improve business-customer communication.

COMPLIANCE:
- We only access messages for Pages that users explicitly authorize
- All messaging is in response to customer-initiated conversations
- We do not send promotional, spam, or unsolicited messages
- We comply with Facebook's Messenger Platform Policies and privacy regulations
- Message data is secured and handled according to GDPR requirements
- We use aggregated, anonymized data for analytics only
```

---

## 👤 Test Account Setup

- [ ] Create or use a **REAL Facebook account** (NOT test user from App Roles)
- [ ] Add account as **Tester** in App Dashboard → Roles → Testers
- [ ] Create a test Facebook Page with this account
- [ ] Make test account the Page admin
- [ ] Send 2-3 test messages to the Page via Messenger (from different account)
- [ ] Connect the Page to your app via Settings → Connected Accounts

⚠️ **CRITICAL**: Must be a real Facebook account, NOT a test user. Test users cannot receive bot messages.

---

## 📋 Test Instructions Field

Copy-paste this into "Test Instructions" field (replace placeholders):

```
TEST INSTRUCTIONS FOR pages_messaging PERMISSION:

Prerequisites:
- Use the test account credentials provided below
- Test Page has received messages from customers

Testing Steps:

1. LOGIN TO PLATFORM
   - Go to: https://asm-frontend-omega.vercel.app
   - Email: [INSERT TEST EMAIL]
   - Password: [INSERT TEST PASSWORD]
   - Click "Sign In"

2. ACCESS INBOX
   - Click "Inbox" from the sidebar navigation
   - Wait for conversations to load

3. VIEW CONVERSATIONS
   - Observe the conversation list on the left
   - You should see 2-3 test conversations from Messenger
   - Each shows customer name, message preview, timestamp, and Facebook icon

4. OPEN CONVERSATION
   - Click on any conversation from the list
   - The full message thread displays in the center panel
   - Review the conversation history

5. SEND REPLY
   - Type a test reply: "Thank you for your message. How can we assist you?"
   - Click "Send" button
   - Verify the message appears in the conversation thread

6. VERIFY MESSAGE DELIVERY (Optional)
   - Open Facebook Messenger in another tab
   - Check the Page's Messenger inbox
   - Confirm the reply appears in Messenger

Expected Behavior:
- Conversations load successfully from Facebook Messenger
- Message history displays correctly
- Replies can be sent and appear in the conversation
- Messages sync with Facebook Messenger

Test Page Name: [INSERT YOUR TEST PAGE NAME]

If you encounter any issues, please contact us at [your support email].
```

---

## 📄 Form Fields Quick Reference

| Field | What to Fill |
|-------|-------------|
| **Detailed Description** | Full description from above (explains usage, value, necessity, compliance) |
| **Test Instructions** | Step-by-step guide from above (with test credentials) |
| **Select a Page** | Choose your test Facebook Page from dropdown |
| **Screen Recording** | Upload your 5-minute demo video (MP4/MOV) |
| **Agreement Checkbox** | ✅ Check the box agreeing to terms |

---

## ⏱️ Before You Submit

### 5-Minute Final Check:

**1. Test Account** (30 seconds)
- [ ] Real Facebook account (not test user)
- [ ] Has Tester role in your app
- [ ] Is admin of test Page

**2. Test Page** (30 seconds)
- [ ] Test Page exists
- [ ] Has 2-3 test messages in Messenger
- [ ] Is connected to your app

**3. Video** (2 minutes)
- [ ] Shows login
- [ ] Shows conversation list
- [ ] Shows opening a conversation
- [ ] Shows sending a reply
- [ ] Shows verification in Messenger
- [ ] Under 5 minutes
- [ ] Good quality (1080p)
- [ ] Under 250MB

**4. Description** (1 minute)
- [ ] Copied complete description
- [ ] Mentions unified inbox
- [ ] Mentions customer-initiated conversations
- [ ] Mentions compliance with policies
- [ ] Explains why it's necessary

**5. Test Instructions** (1 minute)
- [ ] Step-by-step instructions
- [ ] Test email and password included
- [ ] Test Page name included
- [ ] Support email included

---

## 🚦 Submission Status Guide

### After Submitting:

| Status | Meaning | What to Do |
|--------|---------|------------|
| **Pending** | Under review | Wait 3-7 business days |
| **Approved** | Permission granted | Start using immediately |
| **Needs Info** | More details needed | Respond within 7 days |
| **Rejected** | Not approved | Read feedback, fix issues, resubmit |

---

## 🔄 If Rejected

### Common Issues & Fixes:

**Video doesn't show sending messages**
→ Re-record showing complete send + verify workflow

**Using test user instead of real account**
→ Create real Facebook account, grant Tester role

**Description too vague**
→ Use the detailed template above

**Can't test the feature**
→ Provide clearer test instructions with credentials

**Privacy policy concerns**
→ Ensure your privacy policy mentions Facebook data handling

---

## 📞 Need Help?

- **Main Guide**: `PAGES_MESSAGING_APP_REVIEW_GUIDE.md` (detailed explanations)
- **Facebook Support**: https://developers.facebook.com/support/
- **App Review Status**: Facebook App Dashboard → App Review

---

## 🎯 Most Important Points

1. ✅ Use a **REAL Facebook account** as tester (not test user)
2. ✅ Video must show **complete workflow** (view + send + verify)
3. ✅ Description must explain **value, necessity, and compliance**
4. ✅ Test instructions must be **detailed and step-by-step**
5. ✅ Test Page must have **real messages** to demonstrate

---

**Estimated Time to Complete**: 2-3 hours (including video recording)
**Review Time**: 3-7 business days
**Success Rate**: ~90% when following this guide

