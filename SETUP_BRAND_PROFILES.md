# Setup Brand Profiles Table

## 🚨 Error Fix: "Error saving brand profile"

The error occurs because the `brand_profiles` table doesn't exist in your Supabase database yet.

---

## ✅ Quick Fix - Run This SQL

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy & Paste This SQL

Copy the entire contents of `CREATE_BRAND_PROFILES_TABLE.sql` and paste it into the SQL editor.

Or copy this:

```sql
-- Create brand_profiles table
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT,
  industry TEXT,
  tone_of_voice TEXT,
  target_audience TEXT,
  key_values TEXT,
  unique_selling_points TEXT,
  brand_personality TEXT,
  content_guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_brand_profile UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own brand profile"
  ON public.brand_profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own brand profile"
  ON public.brand_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own brand profile"
  ON public.brand_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own brand profile"
  ON public.brand_profiles FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Create index
CREATE INDEX idx_brand_profiles_user_id ON public.brand_profiles(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_brand_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_profiles_updated_at();

-- Grant permissions
GRANT ALL ON public.brand_profiles TO authenticated;
GRANT ALL ON public.brand_profiles TO service_role;
```

### Step 3: Run the Query

Click **Run** or press `Ctrl+Enter`

You should see: ✅ **Success. No rows returned**

---

## 🧪 Verify It Worked

### Check in Table Editor

1. Go to **Table Editor** in Supabase
2. Look for `brand_profiles` table
3. You should see all the columns

### Test in Your App

1. Go to `/settings` in your app
2. Scroll to **Brand Profile** section
3. Fill in some fields
4. Click **Save Brand Profile**
5. You should see: ✅ **Success - Brand profile saved successfully**

---

## 🔍 Troubleshooting

### If you still get errors:

**Check the browser console** - It will now show the actual error message:
```
Supabase error details: { message: "..." }
```

### Common Issues:

1. **"relation does not exist"**
   - Table wasn't created
   - Run the SQL again

2. **"permission denied"**
   - RLS policies not set up
   - Make sure you ran the GRANT commands

3. **"duplicate key value"**
   - You already have a profile
   - This is fine! It will update instead

---

## 📊 What This Creates

### Table Structure:
```
brand_profiles
├── id (UUID, Primary Key)
├── user_id (UUID, Unique, Foreign Key → auth.users)
├── brand_name (TEXT)
├── industry (TEXT)
├── tone_of_voice (TEXT)
├── target_audience (TEXT)
├── key_values (TEXT)
├── unique_selling_points (TEXT)
├── brand_personality (TEXT)
├── content_guidelines (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Security:
- ✅ RLS enabled
- ✅ Users can only see/edit their own profile
- ✅ One profile per user (UNIQUE constraint)
- ✅ Auto-delete when user is deleted

---

## ✨ After Setup

Once the table is created, you can:

1. **Save your brand profile** in Settings
2. **Use it for AI generation** - The AI will read this data
3. **Update anytime** - Changes save automatically
4. **Consistent brand voice** - All AI content matches your style

---

## 🎯 Next Steps

After the table is created and working:

1. Fill out your brand profile completely
2. Test the AI Reply button in Reviews
3. Future: Integrate brand profile into all AI features

---

## Need Help?

If you're still getting errors after running the SQL:

1. Check browser console for detailed error
2. Check Supabase logs
3. Verify you're logged in
4. Make sure `userId` is being passed correctly

The improved error handling will now show you exactly what's wrong! 🔍
