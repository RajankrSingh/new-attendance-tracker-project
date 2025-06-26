/*
  # Fix Authentication and Profile Creation

  1. Database Structure
    - Remove foreign key constraint that references non-existent users table
    - Update profiles table to use auth.users() directly
    - Create proper trigger for profile creation

  2. Security
    - Maintain existing RLS policies
    - Ensure profiles are created automatically on signup

  3. Changes
    - Drop existing foreign key constraint
    - Update trigger function to handle profile creation properly
    - Add constraint to ensure profiles.id matches auth.uid()
*/

-- Drop the existing foreign key constraint that references the non-existent users table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Update the trigger function to properly handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, department, position)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'department', ''),
    COALESCE(NEW.raw_user_meta_data->>'position', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create leave balance for new profiles
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leave_balances (user_id, sick, vacation, personal)
  VALUES (NEW.id, 10, 15, 5);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create leave balance when profile is created
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- Add constraint to ensure profiles.id matches a valid auth user
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_matches_auth_user 
CHECK (id IN (SELECT id FROM auth.users));