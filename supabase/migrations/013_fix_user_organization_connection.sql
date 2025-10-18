-- Fix user organization connection for superadmin
-- This script reconnects the superadmin user to the "Odo Marketing" organization

-- First, let's check and display current state
DO $$
DECLARE
  admin_user_id UUID;
  odo_org_id UUID;
  existing_connection RECORD;
BEGIN
  -- Get the superadmin user ID
  SELECT user_id INTO admin_user_id FROM super_admins LIMIT 1;
  
  -- Get the "Odo Marketing" organization ID
  SELECT id INTO odo_org_id FROM organizations WHERE name = 'Odo Marketing' LIMIT 1;
  
  RAISE NOTICE 'SuperAdmin User ID: %', admin_user_id;
  RAISE NOTICE 'Odo Marketing Org ID: %', odo_org_id;
  
  -- Check if connection exists
  SELECT * INTO existing_connection 
  FROM user_organizations 
  WHERE user_id = admin_user_id 
    AND organization_id = odo_org_id;
  
  IF existing_connection IS NULL THEN
    RAISE NOTICE 'No connection found - will create one';
    
    -- Create the connection if both IDs exist
    IF admin_user_id IS NOT NULL AND odo_org_id IS NOT NULL THEN
      -- Insert or update the user_organizations connection
      INSERT INTO user_organizations (user_id, organization_id, role, joined_at)
      VALUES (admin_user_id, odo_org_id, 'owner', NOW())
      ON CONFLICT (user_id, organization_id) 
      DO UPDATE SET role = 'owner', joined_at = NOW();
      
      RAISE NOTICE 'Connection created/updated successfully!';
    ELSE
      RAISE NOTICE 'Could not create connection - missing user or organization';
    END IF;
  ELSE
    RAISE NOTICE 'Connection already exists with role: %', existing_connection.role;
  END IF;
END $$;

-- Alternative: If you want to connect ALL superadmins to Odo Marketing
-- Uncomment this if needed:
/*
INSERT INTO user_organizations (user_id, organization_id, role, joined_at)
SELECT 
  sa.user_id,
  o.id,
  'owner',
  NOW()
FROM super_admins sa
CROSS JOIN organizations o
WHERE o.name = 'Odo Marketing'
ON CONFLICT (user_id, organization_id) DO NOTHING;
*/

-- Update any reviews that might not have the correct organization_id
UPDATE reviews
SET organization_id = (SELECT id FROM organizations WHERE name = 'Odo Marketing' LIMIT 1)
WHERE organization_id IS NULL 
   OR organization_id NOT IN (SELECT id FROM organizations);

-- Verify the connection
SELECT 
  u.email,
  o.name as organization_name,
  uo.role,
  uo.joined_at
FROM user_organizations uo
JOIN auth.users u ON u.id = uo.user_id
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id IN (SELECT user_id FROM super_admins);
