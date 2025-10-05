# Super Admin Setup Guide

## Overview

The Super Admin role is a special system-wide administrative role that bypasses all Row Level Security (RLS) policies, giving complete access to all data across all organizations. This is essential for:

- **Customer Support**: Helping users troubleshoot issues
- **System Administration**: Managing the entire platform
- **Data Auditing**: Reviewing all system activity
- **Emergency Access**: Resolving critical issues

## How It Works

### 1. **Dedicated Table Approach**
Instead of modifying the auth.users table (which Supabase doesn't allow), we use a dedicated `super_admins` table that references user IDs.

### 2. **Security Functions**
- `is_super_admin(user_uuid)`: Checks if any user is a super admin
- `is_current_user_super_admin()`: Checks if the current logged-in user is a super admin

### 3. **RLS Policy Updates**
All RLS policies now include an OR condition:
```sql
is_current_user_super_admin() OR [original condition]
```

## Setup Instructions

### Step 1: Run the Migration
```bash
# In Supabase SQL Editor, run:
e:\AI Projects\asm\asm\supabase\migrations\006_add_super_admin.sql
```

### Step 2: Add Yourself as Super Admin

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your user account (odo@odomarketing.com)
3. Copy the **User UID** (looks like: `123e4567-e89b-12d3-a456-426614174000`)
4. Go to **Table Editor** → **super_admins**
5. Click **Insert Row** and add:
   - `user_id`: [Your User UID]
   - `reason`: "Initial system administrator"

### Step 3: Verify Access

Test your super admin access by running this query:
```sql
SELECT is_current_user_super_admin();
-- Should return: true
```

## Super Admin Capabilities

With Super Admin status, you can:

### 1. **View All Organizations**
```sql
SELECT * FROM admin_all_organizations;
```

### 2. **See User Organization Summary**
```sql
SELECT * FROM admin_user_organization_summary;
```

### 3. **Access Any Data**
- All social accounts across all organizations
- All analytics data
- All messages and conversations
- All business profiles and reviews

### 4. **Modify Any Data**
- Update organization settings
- Manage user memberships
- Delete problematic content
- Fix data inconsistencies

## Security Considerations

### ⚠️ **Use With Caution**
Super Admin access is extremely powerful. Always:
- Log all administrative actions
- Use read-only queries when possible
- Double-check before modifying data
- Limit the number of super admins

### 🔒 **Access Control**
- Super admins are stored in a dedicated table
- The super_admins table itself has RLS protection
- Only existing super admins can view the super admin list

### 📝 **Audit Trail**
The super_admins table tracks:
- When admin access was granted (`granted_at`)
- Who granted the access (`granted_by`)
- Why access was granted (`reason`)

## Adding Additional Super Admins

To add another super admin (use sparingly):

```sql
-- First, ensure you're logged in as a super admin
INSERT INTO super_admins (user_id, granted_by, reason)
VALUES (
  'new-user-uuid-here',
  auth.uid(),  -- Your UUID as the granter
  'Reason for granting super admin access'
);
```

## Removing Super Admin Access

To revoke super admin access:

```sql
DELETE FROM super_admins WHERE user_id = 'user-uuid-to-remove';
```

## Frontend Integration

In your application, you can check if the current user is a super admin:

```typescript
// In your Supabase client code
const { data, error } = await supabase
  .rpc('is_current_user_super_admin');

if (data === true) {
  // Show admin UI elements
  // Enable admin features
}
```

## Best Practices

1. **Minimal Super Admins**: Keep the number of super admins to an absolute minimum
2. **Regular Audits**: Periodically review who has super admin access
3. **Separate Admin UI**: Consider building a separate admin interface
4. **Activity Logging**: Log all actions taken with super admin privileges
5. **Two-Factor Auth**: Require 2FA for all super admin accounts

## Troubleshooting

### "Access Denied" Despite Being Super Admin
1. Verify your user_id is in the super_admins table
2. Check you're logged in with the correct account
3. Ensure the migration ran successfully

### Can't See Super Admin Features
1. Clear your browser cache
2. Re-authenticate with Supabase
3. Check the frontend is calling `is_current_user_super_admin()`

## Emergency Access

If you lose super admin access:
1. Access Supabase dashboard directly
2. Use the SQL editor with service role
3. Re-add your user to super_admins table

Remember: With great power comes great responsibility. Use super admin access wisely!