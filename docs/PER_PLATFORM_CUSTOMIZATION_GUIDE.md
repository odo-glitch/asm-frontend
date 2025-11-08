# Per-Platform Customization Feature Guide

## 🎯 Overview

Your Create Post page now supports **per-platform customization** - allowing you to create tailored content for each social media account separately!

---

## ✨ What's New

### Feature: "Customize Each Platform Separately"

A toggle that enables individual customization for each selected social media account.

**When OFF (Default):**
- Generate one post for all platforms
- Same content goes to all selected accounts
- Faster and simpler

**When ON:**
- Customize content for each platform
- Different messages, tones, emojis, hashtags per account
- Perfect for multi-platform strategies

---

## 🎨 How to Use

### Step 1: Enable Per-Platform Customization

1. Go to **Create Post** page
2. Switch to **Generate with AI** mode
3. Toggle **"Customize Each Platform Separately"** to ON
4. The interface will adapt to show platform-specific controls

### Step 2: Select Your Platforms

1. Select multiple platforms in the right sidebar
2. Example: LinkedIn (Company Page), Facebook (Page 1), Facebook (Page 2)

### Step 3: Set Default Settings (Optional)

Fill in the default settings that will apply to all platforms unless overridden:
- Post type
- Tone
- Target audience
- Emoji/Hashtag preferences
- Brand voice

### Step 4: Customize Per Platform

Expand each platform's section to customize:

**LinkedIn - Marketing Company**
```
✓ Custom Message: "Excited to announce our B2B solution..."
✓ Post Type: Announcement
✓ Tone: Professional
✓ Goal: Awareness
✓ Hashtags: 3
✓ Emojis: ✗
```

**Facebook - Page 1 (Retail)**
```
✓ Custom Message: "Check out our amazing summer sale! 🌞"
✓ Post Type: Promotional
✓ Tone: Friendly
✓ Goal: Conversion
✓ Hashtags: 5
✓ Emojis: ✓
```

**Facebook - Page 2 (Community)**
```
✓ Custom Message: "We'd love to hear your thoughts..."
✓ Post Type: Question
✓ Tone: Casual
✓ Goal: Engagement
✓ Hashtags: 2
✓ Emojis: ✓
```

### Step 5: Generate Content

Click **"✨ Generate Post with AI"**

The system will:
1. Generate unique content for each platform
2. Apply platform-specific settings
3. Show all results in separate cards

### Step 6: Review & Edit

Each platform shows its generated content in a separate card:
- Edit any content directly
- See character count per platform
- Preview how it will look

### Step 7: Schedule

Click **"Schedule Post"** to schedule all posts at once!

---

## 🎯 Use Cases

### 1. Professional vs Casual Platforms

**LinkedIn (Professional)**
- Longer, detailed posts
- Professional tone
- Minimal emojis
- Industry hashtags

**Instagram (Casual)**
- Shorter, punchy content
- Friendly tone
- Lots of emojis
- Trending hashtags

### 2. Different Audiences Per Page

**Facebook Page 1 (Young Adults)**
- Casual tone
- Emojis and slang
- Engagement-focused
- More hashtags

**Facebook Page 2 (Professionals)**
- Professional tone
- Minimal emojis
- Educational content
- Fewer hashtags

### 3. Language/Regional Variations

**LinkedIn (Global)**
- English, formal
- International examples

**Facebook (Local)**
- Local language
- Regional references
- Local hashtags

### 4. Product vs Community Pages

**LinkedIn (Product)**
- Feature announcements
- Professional benefits
- Conversion goal

**Facebook (Community)**
- User stories
- Community engagement
- Relationship building

---

## 📋 Per-Platform Controls

### Available Customization Options:

#### 1. Custom Message
- **What**: Platform-specific content
- **Example**: "LinkedIn gets detailed info, Instagram gets punchy headline"
- **Optional**: Yes (uses base message if empty)

#### 2. Post Type
- General / Question / Tip / Announcement / Story / Promotional / Educational
- **Default**: Uses default setting

#### 3. Tone
- Professional / Casual / Friendly / Informative / Inspirational
- **Default**: Uses default setting

#### 4. Post Goal
- Engagement / Awareness / Conversion / Education
- **Default**: Uses default setting

#### 5. Hashtag Count
- **Range**: 0-5 hashtags
- **Visual**: Slider control
- **Example**: LinkedIn gets 2, Instagram gets 5

#### 6. Toggles
- ✓ **Emojis**: Include/exclude emojis
- ✓ **Hashtags**: Include/exclude hashtags
- ✓ **CTA**: Include/exclude call-to-action

---

## 🎨 UI Features

### Expandable Platform Cards

Each selected platform shows as a collapsible card:
```
┌─────────────────────────────────────┐
│ ► facebook • My Business Page       │
└─────────────────────────────────────┘

Click to expand:

┌─────────────────────────────────────┐
│ ▼ facebook • My Business Page       │
│                                     │
│ Custom Message (optional)           │
│ [textarea]                          │
│                                     │
│ Post Type    │ Tone                 │
│ [dropdown]   │ [dropdown]           │
│                                     │
│ Goal         │ Hashtags: 3          │
│ [dropdown]   │ [slider]             │
│                                     │
│ ☑ Emojis  ☑ Hashtags  ☑ CTA       │
└─────────────────────────────────────┘
```

### Generated Content Display

After generation, see all platform content:

```
✨ Generated Content Per Platform

┌─────────────────────────────────────┐
│ linkedin • Company Page  (245 chars)│
│                                     │
│ [Generated content textarea]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ facebook • Page 1  (180 chars)      │
│                                     │
│ [Generated content textarea]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ facebook • Page 2  (150 chars)      │
│                                     │
│ [Generated content textarea]        │
└─────────────────────────────────────┘

[Clear All Generated Content]
```

---

## 🚀 Workflow Examples

### Example 1: Quick Multi-Platform Post

**Scenario**: Same message for all platforms

1. Toggle OFF (default)
2. Select: LinkedIn, Facebook, Twitter
3. Enter message
4. Set preferences
5. Generate once
6. Schedule

**Time**: ~2 minutes

---

### Example 2: Tailored Platform Strategy

**Scenario**: Different content per platform

1. Toggle ON "Customize Each Platform Separately"
2. Select platforms
3. Set default preferences
4. Expand each platform
5. Customize message, tone, hashtags
6. Generate
7. Review all generated content
8. Edit if needed
9. Schedule

**Time**: ~5 minutes
**Result**: Platform-optimized content

---

### Example 3: A/B Testing Different Tones

**Scenario**: Test two Facebook pages with different tones

**Facebook Page 1:**
- Tone: Professional
- Hashtags: 2
- CTA: Yes

**Facebook Page 2:**
- Tone: Casual
- Hashtags: 4
- CTA: Yes

**Result**: Compare engagement between approaches

---

## 💡 Best Practices

### 1. When to Use Per-Platform Customization

**Use it when:**
- ✅ Different audiences per platform
- ✅ Platform has different content style (LinkedIn vs Instagram)
- ✅ Different goals per platform
- ✅ Different page types (product vs community)
- ✅ A/B testing different approaches

**Skip it when:**
- ⏭️ Same audience across platforms
- ⏭️ Simple announcement
- ⏭️ Time-sensitive post
- ⏭️ General update

### 2. Platform-Specific Tips

**LinkedIn:**
- Longer content (200-300 words)
- Professional tone
- 2-3 hashtags
- Include insights/data
- Link to blog/article

**Facebook:**
- Medium length (100-200 words)
- Friendly/casual tone
- 3-5 hashtags
- Questions to engage
- Visual-friendly

**Instagram:**
- Short and punchy (50-150 words)
- Casual/inspirational tone
- 5+ hashtags
- Emoji-rich
- Focus on visual

**Twitter/X:**
- Very short (200-280 chars)
- Conversational
- 1-2 hashtags
- Punchy and memorable

### 3. Content Strategy

**Repurpose Smart:**
- Same core message
- Adapt tone per platform
- Adjust length to platform norms
- Platform-specific hashtags
- Audience-appropriate emojis

**Example Content Adaptation:**

**Base Message:**
"We're launching a new feature that helps small businesses save time on social media management"

**LinkedIn Version:**
"Excited to announce our latest innovation in social media management. Our new automation feature helps small businesses save an average of 10 hours per week, allowing them to focus on what matters most - growing their business. 

Key features:
→ Smart scheduling across platforms
→ AI-powered content suggestions
→ Unified analytics dashboard

Learn more: [link]

#SocialMediaManagement #SmallBusiness #Productivity"

**Facebook Version:**
"Big news! 🎉

We just launched a game-changer for small businesses...

Our new feature helps you save 10+ hours every week on social media. Imagine what you could do with that extra time! 

Check it out here → [link]

Who else wants more time in their day? 🙋‍♀️

#SmallBusiness #Productivity #TimeManagement"

**Instagram Version:**
"Your time is precious ⏰

New feature alert! Save 10+ hours per week on social media 🚀

No more stress. More time for what matters. 

Link in bio 👆

#SmallBusiness #SocialMedia #TimeManagement #Productivity #BusinessTools"

---

## 🔧 Technical Details

### How It Works:

1. **Default Settings** - Applied to all platforms as baseline
2. **Platform Overrides** - Custom settings override defaults
3. **Parallel Generation** - AI generates content for each platform simultaneously
4. **Content Storage** - Each platform's content stored separately
5. **Scheduled Separately** - Each post scheduled individually to correct account

### API Calls:

**Without Per-Platform:**
- 1 API call to generate content

**With Per-Platform (3 accounts):**
- 3 API calls to generate content (one per platform)

**Cost**: Slightly higher token usage, but better results!

---

## 🎯 Tips & Tricks

### 1. Start with Defaults

Set good defaults first, then only override what needs to change. Saves time!

### 2. Use Templates

Save common customizations as mental templates:
- "LinkedIn Professional"
- "Instagram Engaging"
- "Facebook Community"

### 3. Don't Overthink

Not every post needs full customization. Use it when it matters.

### 4. Test and Learn

Try different approaches and see what gets better engagement per platform.

### 5. Character Limits

Keep in mind platform character limits:
- Twitter: 280
- Facebook: 2,000+ (but shorter is better)
- LinkedIn: 3,000 (but 200-300 ideal)
- Instagram: 2,200

### 6. Preview Before Scheduling

Always review generated content. AI is smart but not perfect!

---

## 📊 Comparison

| Feature | Single Content | Per-Platform |
|---------|----------------|--------------|
| **Setup Time** | 2 minutes | 5 minutes |
| **Optimization** | Generic | Platform-specific |
| **API Calls** | 1 | 1 per platform |
| **Best For** | Quick posts | Strategic posts |
| **Engagement** | Good | Better |
| **Flexibility** | Low | High |
| **Learning Curve** | Easy | Medium |

---

## 🚨 Common Issues & Solutions

### Issue: "Please generate content for all selected platforms"

**Cause**: Per-platform mode ON but content not generated

**Solution**: Click "Generate Post with AI" button

---

### Issue: Generated content is too similar

**Cause**: Not enough customization in platform settings

**Solution**: 
- Add custom messages per platform
- Change tone significantly
- Adjust hashtag counts
- Toggle emojis differently

---

### Issue: Content too long for platform

**Cause**: Platform character limits

**Solution**:
- AI respects limits, but you can edit
- Trim manually if needed
- Use "shorter" instructions in custom message

---

## 🎓 Learning Path

**Week 1**: Use default mode (single content)
- Get comfortable with basic AI generation
- Learn what works on each platform

**Week 2**: Enable per-platform mode
- Start with just changing hashtag counts
- Experiment with emoji toggles

**Week 3**: Add custom messages
- Write platform-specific hooks
- Adjust tone per platform

**Week 4**: Full customization
- Master all settings
- Develop your multi-platform strategy

---

## 📞 Support

**Need Help?**
- Check generated content before scheduling
- Start simple and add complexity gradually
- Test with one platform first
- Review analytics to see what works

---

**Last Updated**: December 2024  
**Feature Status**: Live ✅  
**Backward Compatible**: Yes (toggle OFF for single content)

