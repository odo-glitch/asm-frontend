# Facebook Permissions & App Review Justifications

## App Overview
**App Name:** ASM - Advanced Social Media Manager  
**App Type:** Social Media Management & CRM Tool  
**Purpose:** Comprehensive social media management platform enabling businesses, content creators, and agencies to schedule content, manage multi-channel conversations (Facebook Messenger, Instagram DMs), track analytics, and provide customer support across Facebook and Instagram from a unified interface.

**Core Value Proposition:**  
Centralize all social media management tasks in one platform - post scheduling, customer communication, performance analytics, and team collaboration - eliminating the need to switch between multiple platforms.

---

## Required Permissions & Justifications

### 1. pages_show_list (OPTIONAL)
**Permission Type:** Standard Access

**Facebook Official Description:**  
Allows the app to retrieve a list of Facebook Pages that the user manages.

**How Our App Uses This Permission:**  
Our social media management platform uses pages_show_list to display all Facebook Pages that a user manages, allowing them to select which Pages to connect to our platform for content management. This permission is essential for:

1. **Account Discovery:** When users connect their Facebook account, we retrieve and display their managed Pages in the Settings > Connected Accounts interface.
2. **Multi-Page Management:** Users managing multiple Pages (agencies, businesses with multiple brands) can view and switch between different Pages within our platform.
3. **Page Selection Interface:** Users choose which specific Pages to integrate with our scheduling, analytics, and inbox features.
4. **Dashboard Display:** Show Page names, profile pictures, and basic information in our main dashboard sidebar.

**Value Added for Users:**  
- Eliminates manual Page ID entry - users simply select from their managed Pages
- Enables seamless multi-Page management for agencies and businesses
- Provides clear visibility of all connected accounts in one interface
- Streamlines onboarding process for new users

**Why It's Necessary:**  
Without this permission, users would need to manually provide Page IDs or access tokens, creating friction in the user experience. This permission is fundamental to our Page selection workflow and is necessary before users can utilize any other Page management features.

**Detailed Use Case:**  
A marketing agency managing 15 different client Facebook Pages logs into our platform. Using pages_show_list, they see all 15 Pages listed with thumbnails and names. They select 10 Pages to connect for active management, while leaving 5 unconnected. These 10 connected Pages now appear in their dashboard for scheduling posts, viewing analytics, and managing customer messages.

**App Flow:**
1. User navigates to Settings → Connected Accounts
2. Clicks "Connect Facebook Account" button
3. Facebook OAuth dialog appears, user grants permissions
4. Our app calls pages_show_list API to retrieve all managed Pages
5. Display Page list with thumbnails, names, and follower counts
6. User selects which Pages to connect (checkboxes)
7. Selected Pages sync to our database and appear in sidebar navigation

---

### 2. pages_read_engagement ⭐ REQUIRED
**Permission Type:** Standard Access Required

**What it does:**  
Allows the app to read content (posts, photos, videos, events) published by the Page and engagement metrics (reactions, comments, shares).

**Why we need it:**  
Our analytics feature requires this permission to:
- Display post performance metrics (likes, comments, shares, reach)
- Show engagement trends over time
- Provide insights on best-performing content
- Track audience interaction with published posts
- Read followers data (name, PSID, profile picture)
- Access Page metadata and insights
- Generate performance reports for content strategy optimization

**Use case scenario:**  
Users need to analyze how their content performs to make data-driven decisions. Our Analytics page displays metrics like engagement rate, reach, and audience interactions for each post published through our platform.

**Detailed Facebook Justification:**  
"Our social media management platform uses pages_read_engagement to power our Analytics Dashboard where Page administrators can view and analyze their content performance. This helps them:

1. Track post performance metrics (likes, comments, shares, reach, impressions)
2. Understand audience engagement patterns to optimize posting strategy
3. View follower demographics and growth trends
4. Identify top-performing content types
5. Generate weekly/monthly performance reports

This permission adds value by providing Page admins with data-driven insights to improve their content strategy and increase audience engagement. Without this permission, users would have to manually check Facebook Insights, which defeats the purpose of our centralized management platform.

We use aggregated and anonymized data for analytics purposes and do not share individual user data with third parties. All data handling complies with Facebook Platform Policies and GDPR requirements."

**Test Instructions for Review:**
```
Step 1: Log in to our platform at [your-url] using the test account credentials
Step 2: Navigate to Settings > Connected Accounts
Step 3: Connect the test Facebook Page provided
Step 4: Navigate to Analytics page from the sidebar
Step 5: View the Analytics Dashboard showing post performance metrics
Step 6: Select different time periods (7 days, 30 days, 90 days) to see engagement trends
Step 7: Click on individual posts to see detailed metrics (likes, comments, shares, reach)
Step 8: View the follower growth chart and audience demographics section
```

---

### 3. pages_manage_posts
**Permission Type:** Standard Access Required

**What it does:**  
Allows the app to create, edit, and delete posts on behalf of the Page.

**Why we need it:**  
This is our core functionality. Users need this to:
- Schedule posts to be published at specific times
- Create and publish new content (text, images, videos)
- Edit published posts to correct errors or update information
- Delete posts if needed
- Manage content calendar with planned publications

**Use case scenario:**  
A business owner creates a promotional post in our platform, schedules it for optimal posting time (e.g., 2 PM next Tuesday), and our system automatically publishes it to their Facebook Page at the scheduled time. They can also edit or delete posts directly from our dashboard.

---

### 4. pages_read_user_content
**Permission Type:** Standard Access Required

**What it does:**  
Allows the app to read user-generated content on the Page (visitor posts, comments).

**Why we need it:**  
Our Inbox feature requires this to:
- Display messages and comments from followers
- Enable unified inbox for managing all customer interactions
- Show visitor posts on the Page
- Allow businesses to respond to customer inquiries
- Track and manage community engagement

**Use case scenario:**  
When a customer comments on a Page's post or sends a message, the business owner sees it in our unified inbox and can respond directly from our platform without switching to Facebook.

---

### 5. pages_manage_engagement
**Permission Type:** Standard Access Required

**What it does:**  
Allows the app to create, edit, and delete comments and reactions on behalf of the Page.

**Why we need it:**  
This enables community management features:
- Respond to customer comments on posts
- Like or react to user comments
- Moderate community discussions
- Engage with audience directly from our platform
- Delete spam or inappropriate comments

**Use case scenario:**  
A customer asks a question in the comments of a promotional post. The business owner responds to the question directly from our platform's inbox, providing customer support without leaving our app.

---

### 6. pages_messaging ⭐ REQUIRED
**Permission Type:** Standard Access Required

**What it does:**  
Allows the app to manage and access Page conversations in Messenger.

**Why we need it:**  
Our unified Inbox feature requires this permission to:
- Display Messenger conversations with Page followers
- Enable businesses to respond to customer messages from our platform
- Provide customer support through Messenger without leaving our app
- View message history for context in customer interactions
- Create user-initiated interactive experiences
- Send customer support responses to inquiries

**Use case scenario:**  
A customer sends a product inquiry via Messenger to a business's Facebook Page. The business owner sees this message in our platform's unified Inbox alongside comments from other posts, and responds directly without switching between multiple apps. This streamlines customer service and ensures faster response times.

**Detailed Facebook Justification:**  
"Our social media management platform uses pages_messaging to enable businesses to manage their Messenger conversations in a centralized inbox. This permission is essential for:

1. **Customer Support:** Businesses can respond to customer inquiries, questions, and support requests through Messenger directly from our platform.
2. **Unified Communications:** Our Inbox consolidates messages from Messenger, post comments, and other interactions in one place, improving response time and customer satisfaction.
3. **Conversation Management:** Users can view message history, track conversations, and maintain context when communicating with customers.
4. **User-Initiated Interactions:** All messaging is in response to customer-initiated conversations, supporting legitimate business communication.

This permission adds significant value by:
- Reducing response time to customer inquiries
- Centralizing all customer communications in one interface
- Eliminating the need to switch between multiple platforms
- Improving customer service efficiency

We only handle user-initiated messages and comply with Facebook's messaging policies. We do not send promotional or spam messages. All data is handled according to Facebook Platform Policies and privacy regulations."

**Test Instructions for Review:**
```
Step 1: Create a real Facebook account (not test user) and grant it Tester role in App Roles
Step 2: Create a test Facebook Page and add the tester account as Page admin
Step 3: Send a message to the test Page via Messenger (m.me/[page-name])
Step 4: Log in to our platform at [your-url] with the test account
Step 5: Navigate to Settings > Connected Accounts and connect the test Page
Step 6: Navigate to Inbox page from the sidebar
Step 7: View the Messenger conversation that was sent in Step 3
Step 8: Click on the conversation to view message history
Step 9: Type a response and send it
Step 10: Check Messenger to confirm the response was delivered
```

---

### 7. instagram_business_manage_messages ⭐ REQUIRED (if supporting Instagram)
**Permission Type:** Standard Access Required

**What it does:**  
Allows the app to access, view, manage, and respond to messages on an Instagram professional account.

**Why we need it:**  
Our unified Inbox feature extends to Instagram for businesses with connected Instagram accounts:
- Display Instagram Direct Messages in our unified inbox
- Enable businesses to respond to Instagram DMs from our platform
- Provide customer relationship management (CRM) capabilities
- View and manage Instagram message threads
- Support multi-channel customer communication

**Use case scenario:**  
A business receives a product inquiry via Instagram DM. Instead of switching between Facebook, Instagram, and other apps, the business owner views and responds to all messages (Facebook comments, Messenger, Instagram DMs) from our centralized Inbox. This creates a seamless customer service experience across all platforms.

**Detailed Facebook Justification:**  
"Our social media management platform uses instagram_business_manage_messages to provide comprehensive customer communication management across Facebook and Instagram. This permission enables:

1. **Cross-Platform Inbox:** Users manage Instagram DMs alongside Facebook messages in a single, unified interface.
2. **Customer Relationship Management:** Businesses use our platform as a CRM tool to track and respond to customer interactions across all channels.
3. **Improved Response Times:** Centralizing Instagram messages with other communications allows faster customer support.
4. **Professional Account Management:** Businesses can maintain their Instagram presence without constantly switching apps.

This permission adds value by:
- Consolidating all customer messages in one location
- Reducing the complexity of managing multiple social media platforms
- Improving customer satisfaction through faster response times
- Enabling better customer relationship tracking

We only access messages for connected Instagram business accounts that users explicitly authorize. All data handling complies with Facebook Platform Policies, GDPR, and privacy regulations. We use anonymized analytics data to improve app functionality."

**Test Instructions for Review:**
```
Step 1: Create a real Facebook account and Instagram professional account
Step 2: Connect the Instagram account to a Facebook Page
Step 3: Grant the test account Tester role in App Roles
Step 4: Send a test message to the Instagram professional account via Instagram DM
Step 5: Log in to our platform at [your-url] with the test account
Step 6: Navigate to Settings > Connected Accounts
Step 7: Connect both the Facebook Page and Instagram account
Step 8: Navigate to Inbox page from the sidebar
Step 9: View the Instagram DM conversation in the unified inbox
Step 10: Click on the conversation to view message details
Step 11: Type a response and send it
Step 12: Check Instagram to confirm the response was delivered
```

---

### 8. pages_manage_metadata (OPTIONAL)
**Permission Type:** Standard Access

**Facebook Official Description:**  
Allows the app to subscribe and receive webhooks about activity on the Page, and to update settings on the Page.

**How Our App Uses This Permission:**  
Our platform uses pages_manage_metadata to enable real-time notifications and webhook subscriptions for Page activities. This permission is essential for:

1. **Webhook Subscriptions:** Subscribe to real-time events (new messages, comments, post interactions) to update our unified inbox instantly without constant polling.
2. **Real-Time Notifications:** Receive immediate notifications when customers send messages or comment on posts, enabling faster response times.
3. **Activity Monitoring:** Track Page events to keep our analytics and inbox synchronized with Facebook in real-time.
4. **Page Settings Management:** Allow Page administrators to manage certain Page settings directly from our platform (optional feature).

**Value Added for Users:**  
- **Instant Updates:** Customers receive notifications the moment a message arrives, not minutes later
- **Reduced API Calls:** Webhooks eliminate the need for constant polling, improving performance
- **Better User Experience:** Real-time inbox updates create a responsive, modern messaging interface
- **Resource Efficiency:** Webhooks consume less server resources than polling every few seconds

**Why It's Necessary:**  
Without webhook subscriptions, our inbox would need to poll Facebook's API every few seconds to check for new messages, creating delays in customer communication and consuming excessive API quota. Webhooks enable instant message delivery, which is critical for customer support applications.

**Detailed Use Case:**  
A retail business receives a customer inquiry via Facebook Messenger about product availability. With pages_manage_metadata (webhooks enabled), the message appears instantly in our inbox interface. The business owner receives a browser notification and responds within 30 seconds. Without this permission, the message might only appear after the next polling interval (30-60 seconds), delaying customer service.

**Technical Implementation:**  
- Subscribe to `messages` webhook for instant Messenger notifications
- Subscribe to `feed` webhook for new post comments
- Subscribe to `conversations` webhook for Instagram DM updates
- All webhook data is processed securely and displayed in our unified inbox

**App Flow:**
1. User connects their Facebook Page with pages_manage_metadata permission
2. Our server automatically subscribes to relevant Page webhooks (messages, comments, conversations)
3. Customer sends a message to the business's Facebook Page
4. Facebook sends webhook event to our server instantly
5. Our inbox updates in real-time, displaying the new message
6. User sees browser notification and can respond immediately

---

### 9. public_profile
**Permission Type:** Default Permission

**What it does:**  
Provides access to basic profile information (name, profile picture, user ID).

**Why we need it:**  
Required for user authentication and identification:
- Display user's name and profile picture in our app
- Identify and authenticate users logging in
- Personalize the user experience
- Link Facebook account to our platform's user account

---

### 8. email
**Permission Type:** Default Permission

**What it does:**  
Access to the user's primary email address.

**Why we need it:**  
Essential for account management:
- Create user accounts in our system
- Send important notifications (scheduled post confirmations, errors)
- Account recovery and password reset
- Communication about account activity

---

### 9. pages_utility_messaging (OPTIONAL)
**Permission Type:** Standard Access

**Facebook Official Description:**  
Allows an app to access a Page's utility messaging templates and send utility messages through Messenger.

**How Our App Uses This Permission:**  
Our platform uses pages_utility_messaging to enable businesses to send automated, non-promotional utility messages to customers, such as:

1. **Appointment Reminders:** Businesses can send booking confirmations and appointment reminders to customers who scheduled via Messenger
2. **Order Updates:** E-commerce businesses can send order confirmations, shipping notifications, and delivery updates
3. **Service Notifications:** Send service-related updates (account status, subscription renewals, payment confirmations)
4. **Template Management:** Users can create, view, and manage utility message templates from our platform

**Value Added for Users:**  
- **Automated Customer Updates:** Eliminate manual message sending for routine transactional updates
- **Professional Communication:** Use pre-approved templates for consistent, compliant messaging
- **Improved Customer Experience:** Keep customers informed with timely, relevant updates
- **Integration Support:** Works with business systems (booking software, e-commerce platforms) to trigger automatic messages

**Why It's Necessary:**  
Many businesses using social media management platforms also need to send transactional messages to customers. Rather than forcing businesses to use separate tools, this permission allows them to manage all customer communications (conversational and transactional) from one platform.

**Allowed Usage Compliance:**  
- Only send utility messages for legitimate business purposes (confirmations, updates, reminders)
- No promotional or marketing content in utility messages
- Messages are triggered by customer actions (purchases, bookings, inquiries)
- Use approved templates that comply with Facebook Messenger policies
- Respect customer preferences and opt-out requests

**Detailed Use Case:**  
A hair salon uses our platform to manage their Facebook Page. When a customer books an appointment via Messenger, our platform (integrated with their booking system) sends:
1. Immediate booking confirmation with appointment details
2. Reminder message 24 hours before the appointment
3. Follow-up message after the appointment asking for feedback

All messages use pre-approved utility templates and are sent only to customers who initiated the booking conversation.

**App Flow:**
1. User creates utility message templates in our platform
2. Templates are submitted to Facebook for approval via our app
3. Once approved, templates appear in our messaging interface
4. Business integrates our platform with their booking/e-commerce system
5. Customer action triggers utility message (booking, purchase, etc.)
6. Our system sends message using approved template
7. Customer receives relevant, timely update via Messenger

**Note:** This permission is OPTIONAL and should only be requested if you have features for transactional messaging. If your platform focuses solely on conversational messaging and customer support, you may skip this permission.

### 10. business_management (OPTIONAL)
**Permission Type:** Standard Access

**Facebook Official Description:**  
Allows the app to read and write with the Business Manager API. Enables management of business assets such as ad accounts, Pages, and other business resources.

**How Our App Uses This Permission:**  
Our platform uses business_management to provide enterprise and agency clients with comprehensive business asset management capabilities:

1. **Multi-Account Management:** Agencies managing multiple client businesses can view and access all Pages under their Business Manager umbrella
2. **Team Collaboration:** Enable team members to access Pages and assets shared through Facebook Business Manager
3. **Business Asset Organization:** Display Pages organized by business account, making it easier for agencies to manage client portfolios
4. **Analytics Aggregation:** Access aggregated analytics data across multiple Pages within a Business Manager for enterprise reporting
5. **Ad Account Integration:** For businesses running Facebook ads alongside organic content, integrate ad account data with social media management

**Value Added for Users:**  
- **Agency Scalability:** Marketing agencies can manage hundreds of client Pages organized by business account
- **Enterprise Structure:** Large organizations with multiple brands can maintain proper business hierarchies
- **Team Permissions:** Respect Facebook Business Manager roles and permissions within our platform
- **Comprehensive Analytics:** View performance data across entire business portfolios
- **Professional Workflows:** Support complex business structures common in enterprise social media management

**Why It's Necessary:**  
Agencies and enterprises typically manage their Pages through Facebook Business Manager for organization, permissions, and billing purposes. Without business_management permission, our platform cannot properly integrate with their existing business structure, forcing them to manually manage each Page individually rather than leveraging their Business Manager organization.

**Allowed Usage Compliance:**  
- Only access business assets that users explicitly authorize
- Respect Business Manager roles and permissions
- Use data for analytics and management purposes only
- Aggregate data is anonymized and de-identified for app improvements
- No unauthorized changes to business asset settings

**Detailed Use Case:**  
A digital marketing agency manages 50 different client businesses, each with 2-5 Facebook Pages (150+ Pages total). All clients are organized in the agency's Facebook Business Manager. Using business_management permission, the agency:
1. Logs into our platform once with their Business Manager account
2. Views all 150 Pages organized by client business name
3. Assigns team members to specific client accounts
4. Generates monthly reports for each client with aggregated Page performance
5. Maintains proper access controls inherited from Business Manager

Without this permission, they would need to connect each of 150 Pages individually, losing all organizational structure and making management nearly impossible.

**App Flow:**
1. Agency user connects Business Manager account to our platform
2. Our app requests business_management permission
3. User grants access to specific Business Manager account
4. We retrieve business structure and associated Pages
5. Display Pages organized by business/client in our interface
6. User selects which Pages/businesses to actively manage
7. Team members inherit appropriate permissions based on Business Manager roles
8. Analytics can be viewed at Page level or aggregated at business level

**Target Users for This Permission:**
- Marketing agencies managing multiple client accounts
- Enterprise organizations with multiple brands
- Businesses using Business Manager for organization
- Teams requiring structured access controls

**Note:** This permission is OPTIONAL and primarily valuable for agency and enterprise customers. If your platform targets individual creators or small businesses who don't use Facebook Business Manager, you may skip this permission.

---

## 📋 Permission Summary

### ✅ CORE REQUIRED Permissions:
1. **pages_messaging** ⭐ - Messenger inbox management and customer support (REQUIRED)
2. **instagram_business_manage_messages** ⭐ - Instagram DM management for unified inbox (REQUIRED if supporting Instagram)
3. **pages_read_engagement** - Analytics, insights, and engagement metrics
4. **public_profile** - User authentication (default permission)
5. **email** - Account management (default permission)

### ⚠️ OPTIONAL Permissions (Agency & Enterprise Features):
6. **pages_show_list** - Display and select managed Pages
7. **pages_manage_metadata** - Real-time webhooks and notifications
8. **pages_utility_messaging** - Automated transactional messages (appointments, orders)
9. **business_management** - Business Manager integration for agencies
10. **pages_read_engagement** - Advanced analytics and reporting

### 📊 Recommended Permission Request Strategy:

**For Basic Launch (Minimum Viable Product):**
- pages_messaging
- instagram_business_manage_messages  
- public_profile
- email

**For Full-Featured Platform:**
- All Core Required permissions
- pages_show_list
- pages_manage_metadata
- pages_read_engagement

**For Agency/Enterprise Tier:**
- All above permissions
- business_management
- pages_utility_messaging (if you build booking/e-commerce features)

---

## Business Verification Information

### Business Use Case
We provide a comprehensive social media management solution for businesses, content creators, and marketing agencies. Our platform centralizes content creation, scheduling, publishing, analytics, and community management across multiple social media platforms, including Facebook Pages.

### Target Audience
- Small to medium businesses managing their social media presence
- Social media managers handling multiple client accounts
- Marketing agencies managing campaigns for various brands
- Content creators maintaining multiple Facebook Pages
- Enterprise teams coordinating social media strategy

### Key Features Requiring Permissions
1. **Content Scheduler** - Schedule posts in advance (requires `pages_manage_posts`)
2. **Analytics Dashboard** - Track post performance and engagement (requires `pages_read_engagement`)
3. **Unified Inbox** - Manage messages and comments in one place (requires `pages_read_user_content`, `pages_manage_engagement`)
4. **Multi-Page Management** - Switch between multiple Pages (requires `pages_show_list`)
5. **Calendar View** - Visual content calendar with drag-and-drop scheduling
6. **AI Content Generator** - AI-powered post creation and optimization

### Data Privacy & Security
- We only request minimum permissions necessary for core functionality
- User data is encrypted in transit and at rest
- We do not share user data with third parties
- Users can disconnect their Facebook Pages at any time
- We comply with GDPR, CCPA, and Facebook Platform Policies

---

## App Review Submission Details

### Screencast/Video Demonstration
**What to show:**
1. User logs in to the platform
2. User navigates to Settings → Connected Accounts
3. User clicks "Connect Facebook Account"
4. OAuth flow displays requested permissions
5. User authenticates and grants permissions
6. App displays list of user's Pages (`pages_show_list` in action)
7. User selects a Page to connect
8. User navigates to Create Post page
9. User creates and schedules a post (`pages_manage_posts` in action)
10. User views Analytics dashboard showing engagement metrics (`pages_read_engagement` in action)
11. User opens Inbox to see and respond to comments (`pages_read_user_content` and `pages_manage_engagement` in action)

### Test User Credentials
Create a test Facebook Page with sample content that demonstrates all features requiring the requested permissions.

### Privacy Policy URL
Ensure you have a comprehensive privacy policy that addresses:
- What data you collect and why
- How you use Facebook data
- How users can delete their data
- Your data retention policies
- Third-party data sharing (if any)

### Terms of Service URL
Include clear terms that explain:
- Your service functionality
- User responsibilities
- Facebook Platform compliance
- Account termination policies

---

## Common Rejection Reasons & How to Avoid Them

### 1. Insufficient Use Case Explanation
**Solution:** Be very specific about HOW each permission is used. Show exact UI flows where the permission is utilized.

### 2. Missing Video Demonstration
**Solution:** Provide a clear screencast (2-5 minutes) showing every permission in action with real use cases.

### 3. Unclear App Purpose
**Solution:** Clearly state that this is a social media management platform in the app description and review notes.

### 4. Privacy Policy Issues
**Solution:** Ensure your privacy policy explicitly mentions Facebook data usage and user rights.

### 5. Overly Broad Permissions
**Solution:** Only request permissions you actually use. Remove any unused permissions before submission.

---

## Sample App Review Notes

```
Our platform is a social media management tool that helps businesses schedule content, 
analyze performance, and engage with their audience across Facebook Pages.

PAGES_SHOW_LIST: Used to display a list of Pages the user manages so they can select 
which Pages to connect to our platform. Shown in Settings > Connected Accounts.

PAGES_MANAGE_POSTS: Core feature - allows users to create and schedule posts to their 
Pages. Used in our Create Post page and Calendar scheduler.

PAGES_READ_ENGAGEMENT: Powers our Analytics dashboard where users view post performance 
metrics (likes, comments, shares, reach) to optimize their content strategy.

PAGES_READ_USER_CONTENT: Enables our Inbox feature where users can view and manage 
comments and messages from their Page followers.

PAGES_MANAGE_ENGAGEMENT: Allows users to respond to comments and engage with their 
audience directly from our unified inbox.

Please see our demo video showing each permission in use within the app flow.
```

---

## Additional Resources

- **Facebook Platform Policy:** https://developers.facebook.com/docs/development/release/policies
- **App Review Guidelines:** https://developers.facebook.com/docs/app-review
- **Permissions Reference:** https://developers.facebook.com/docs/permissions/reference
- **Business Verification:** https://developers.facebook.com/docs/development/release/business-verification

---

## Checklist Before Submission

- [ ] All features using requested permissions are fully functional
- [ ] Privacy Policy is up-to-date and accessible
- [ ] Terms of Service are clear and accessible
- [ ] Demo video shows all permissions in action
- [ ] Test user has access to test Page with sample content
- [ ] App description clearly states it's a social media management tool
- [ ] Business verification is completed (if required)
- [ ] App complies with Facebook Platform Policies
- [ ] All requested permissions are actually used in the app
- [ ] Review notes clearly explain each permission's use case

---

**Last Updated:** October 2025  
**Version:** 1.0
