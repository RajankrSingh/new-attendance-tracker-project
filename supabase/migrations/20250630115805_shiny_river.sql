/*
  # Add Phone Authentication Support

  1. New Columns
    - `phone` (text, nullable) - Phone number for SMS authentication
  
  2. Database Changes
    - Add phone column to profiles table
    - Update email constraint to allow null emails (for phone-only users)
    - Add constraint to ensure either email or phone is present
    - Add unique constraints for both email and phone
    - Update handle_new_user function to support phone authentication
  
  3. Security
    - Maintain existing RLS policies
    - Update triggers for phone authentication support
*/

-- Add phone column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;

-- Drop the email constraint first, then the index
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_key'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_email_key;
  END IF;
END $$;

-- Now we can safely drop the index if it exists
DROP INDEX IF EXISTS profiles_email_key;

-- Update email column to allow nulls
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- Add a constraint to ensure either email or phone is present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_email_or_phone_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_email_or_phone_check 
    CHECK (email IS NOT NULL OR phone IS NOT NULL);
  END IF;
END $$;

-- Create unique constraint on email (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_key ON profiles (email) WHERE email IS NOT NULL;

-- Add unique constraint on phone (allowing nulls)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_key ON profiles (phone) WHERE phone IS NOT NULL;

-- Update the handle_new_user function to support phone authentication
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
  user_department TEXT;
  user_position TEXT;
  user_phone TEXT;
  user_email TEXT;
BEGIN
  -- Extract user metadata with fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'display_name',
    CASE 
      WHEN NEW.phone IS NOT NULL THEN 'Phone User'
      ELSE split_part(COALESCE(NEW.email, ''), '@', 1)
    END
  );
  
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  user_department := COALESCE(NEW.raw_user_meta_data->>'department', 'General');
  user_position := COALESCE(NEW.raw_user_meta_data->>'position', 'Employee');
  user_phone := NEW.phone;
  user_email := NEW.email;

  -- Insert profile immediately
  INSERT INTO public.profiles (id, email, phone, name, role, department, position)
  VALUES (
    NEW.id,
    user_email,
    user_phone,
    user_name,
    user_role::TEXT,
    user_department,
    user_position
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    name = COALESCE(EXCLUDED.name, profiles.name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    department = COALESCE(EXCLUDED.department, profiles.department),
    position = COALESCE(EXCLUDED.position, profiles.position),
    updated_at = now();
  
  -- Create leave balance for new user
  INSERT INTO public.leave_balances (user_id, sick, vacation, personal)
  VALUES (NEW.id, 10, 15, 5)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data OR OLD.phone IS DISTINCT FROM NEW.phone)
  EXECUTE FUNCTION handle_new_user();