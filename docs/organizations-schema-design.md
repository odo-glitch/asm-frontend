# Organizations Schema Design

## Overview

The organizations schema implements a **many-to-many relationship** between users and organizations, allowing:
- A single user to belong to multiple organizations
- Each membership to have a specific role
- Fine-grained permissions control

## Core Tables

### 1. **organizations**
Stores organization details:
- `id`: Unique identifier
- `name`: Organization name
- `slug`: URL-friendly identifier
- `created_by`: User who created the org
- Other metadata (logo, website, settings)

### 2. **user_organizations** (Junction Table)
This is the critical table that enables many-to-many relationships:
```sql
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB,
  UNIQUE(user_id, organization_id)  -- Prevents duplicate memberships
);
```

**Key Design Features:**
- ✅ **Many-to-Many**: Links users to organizations
- ✅ **Role-Based**: Each membership has a specific role
- ✅ **No Duplicates**: UNIQUE constraint prevents a user from having multiple roles in the same org
- ✅ **Cascading Deletes**: Memberships are automatically removed when user or org is deleted
- ✅ **Extensible Permissions**: JSONB field for custom permissions

## Role Hierarchy

1. **Owner**
   - Full control over organization
   - Can delete organization
   - Can manage all members and settings
   - Can transfer ownership

2. **Admin**
   - Can manage members (invite/remove)
   - Can manage organization settings
   - Can manage social accounts
   - Cannot delete organization

3. **Member**
   - Can view and use organization resources
   - Can create content
   - Cannot manage other users

4. **Viewer**
   - Read-only access
   - Can view analytics and content
   - Cannot make changes

## Multi-Tenancy Implementation

The schema extends existing tables to support organizations:

```sql
-- Social accounts can belong to either a user OR an organization
ALTER TABLE social_accounts ADD COLUMN organization_id UUID;

-- Constraint ensures account belongs to EITHER user OR org, not both
ALTER TABLE social_accounts ADD CONSTRAINT social_accounts_owner_check 
  CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR 
         (user_id IS NULL AND organization_id IS NOT NULL));
```

## Row Level Security (RLS)

The RLS policies ensure users can only access data they're authorized for:

```sql
-- Users can view social accounts they have access to
CREATE POLICY "Users can view social accounts they have access to"
  ON social_accounts FOR SELECT
  USING (
    -- Personal accounts
    (user_id = auth.uid() AND organization_id IS NULL) OR
    -- Organization accounts (if user is a member)
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
    ))
  );
```

## Example Queries

### 1. Get all organizations for a user:
```sql
SELECT o.*, uo.role
FROM organizations o
JOIN user_organizations uo ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();
```

### 2. Check if user can manage an organization:
```sql
SELECT EXISTS (
  SELECT 1 FROM user_organizations
  WHERE organization_id = $1
  AND user_id = auth.uid()
  AND role IN ('owner', 'admin')
);
```

### 3. Get all members of an organization:
```sql
SELECT u.*, uo.role, uo.joined_at
FROM auth.users u
JOIN user_organizations uo ON u.id = uo.user_id
WHERE uo.organization_id = $1;
```

## Invitation System

The schema includes an invitation system:
- Admins can invite users by email
- Invitations have expiry dates (7 days default)
- Token-based acceptance
- Automatic role assignment upon acceptance

## Advantages of This Design

1. **Flexibility**: Users can have different roles in different organizations
2. **Scalability**: Efficient queries with proper indexes
3. **Security**: RLS ensures data isolation between organizations
4. **Extensibility**: JSONB permissions field allows custom permissions
5. **Audit Trail**: Tracks who invited whom and when

## Migration Path

To migrate existing single-user data to organizations:

1. Create a default organization for each user
2. Assign user as owner
3. Link existing resources to the organization
4. Update RLS policies

This design follows database normalization best practices and provides a solid foundation for multi-tenant SaaS applications.