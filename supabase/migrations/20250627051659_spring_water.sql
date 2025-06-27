/*
  # Fix Authentication System

  1. Database Changes
    - Fix the user profile creation trigger
    - Ensure proper RLS policies
    - Fix foreign key constraints

  2. Authentication Flow
    - Handle both email/password and Google OAuth
    - Ensure profiles are created properly
    - Fix login issues
*/

-- First, let's make sure we have the right structure
-- Drop and recreate the handle_new_user function with better error handling
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
  user_department TEXT;
  user_position TEXT;
BEGIN
  -- Extract user metadata with fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  user_department := COALESCE(NEW.raw_user_meta_data->>'department', 'General');
  user_position := COALESCE(NEW.raw_user_meta_data->>'position', 'Employee');

  -- Insert profile
  INSERT INTO public.profiles (id, email, name, role, department, position)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role::TEXT,
    user_department,
    user_position
  );
  
  -- Create leave balance for new user
  INSERT INTO public.leave_balances (user_id, sick, vacation, personal)
  VALUES (NEW.id, 10, 15, 5);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix the profiles table constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to be more permissive for profile creation
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Allow authenticated users to insert profiles (needed for trigger)
CREATE POLICY "Allow profile creation"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow any authenticated user to create profiles

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure leave_balances has proper RLS
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own leave balance" ON leave_balances;
DROP POLICY IF EXISTS "Admins can manage all leave balances" ON leave_balances;

CREATE POLICY "Users can read own leave balance"
  ON leave_balances
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all leave balances"
  ON leave_balances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow authenticated users to insert leave balances (for trigger)
CREATE POLICY "Allow leave balance creation"
  ON leave_balances
  FOR INSERT
  TO authenticated
  WITH CHECK (true);