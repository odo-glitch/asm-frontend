# Fix Organization ID in Browser

## Problem
Your organization ID in localStorage might not match your actual organization in the database.

## Step 1: Get Your Real Organization ID

Run this in **Supabase SQL Editor**:

```sql
SELECT 
  uo.organization_id,
  o.name as organization_name,
  uo.role
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();
```

**Copy the `organization_id` value** (it looks like: `550e8400-e29b-41d4-a716-446655440000`)

---

## Step 2: Check What's in Your Browser

Open **Browser Console** (F12 → Console tab) and run:

```javascript
// Check current value
console.log('Current selectedOrgId:', localStorage.getItem('selectedOrgId'));

// Check if it exists
if (localStorage.getItem('selectedOrgId')) {
  console.log('✅ Organization ID is set');
} else {
  console.log('❌ No organization ID set!');
}
```

---

## Step 3: Set the Correct Organization ID

In the **Browser Console**, run this (replace with YOUR org ID from Step 1):

```javascript
// REPLACE 'your-org-id-here' with the actual UUID from Step 1
localStorage.setItem('selectedOrgId', 'your-org-id-here');

// Verify it was set
console.log('✅ Set to:', localStorage.getItem('selectedOrgId'));

// Reload the page
location.reload();
```

---

## Step 4: Alternative - Use the Sidebar

1. Open your app
2. Look at the **left sidebar**
3. Find the **organization/brand switcher** (usually at the top)
4. Click on it and **select your organization**
5. This should automatically set the correct ID

---

## Step 5: Verify It Works

After setting the organization ID:

1. Refresh the page
2. Open Console (F12)
3. Try creating an announcement
4. Check the console - you should see:
   ```
   Creating announcement: {organizationId: "...", userId: "...", title: "..."}
   ```
5. The organizationId should match the one from Step 1

---

## Quick Check Script

Run this in **Browser Console** to see everything at once:

```javascript
console.log('=== ORGANIZATION DEBUG ===');
console.log('Selected Org ID:', localStorage.getItem('selectedOrgId'));
console.log('All localStorage keys:', Object.keys(localStorage));

// If you want to clear it and start fresh:
// localStorage.removeItem('selectedOrgId');
// console.log('Cleared selectedOrgId');
```

---

## If Still Not Working

The issue might be that the sidebar organization switcher isn't saving to localStorage. Check if there's a `BrandSwitcher` component that should be setting this value when you select an organization.
