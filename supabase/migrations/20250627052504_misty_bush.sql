/*
  # Disable email confirmation for development

  1. Configuration Changes
    - Disable email confirmation requirement
    - Allow users to sign in immediately after signup
    - Fix authentication flow for development environment

  2. Security Notes
    - This is for development purposes
    - In production, you should enable email confirmation
    - Users can sign in immediately after creating account
*/

-- This migration helps with the email confirmation issue
-- The actual email confirmation setting needs to be changed in Supabase Dashboard
-- Go to Authentication > Settings and disable "Enable email confirmations"

-- For now, let's ensure our trigger works properly for immediate login
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
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  user_department := COALESCE(NEW.raw_user_meta_data->>'department', 'General');
  user_position := COALESCE(NEW.raw_user_meta_data->>'position', 'Employee');

  -- Insert profile immediately
  INSERT INTO public.profiles (id, email, name, role, department, position)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role::TEXT,
    user_department,
    user_position
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also handle updates (for OAuth providers like Google)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION handle_new_user();