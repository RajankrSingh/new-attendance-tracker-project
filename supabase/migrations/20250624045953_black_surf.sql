/*
  # Fix authentication and profile creation

  1. Database Changes
    - Remove broken foreign key constraint that references non-existent users table
    - Update trigger functions to properly handle user registration
    - Create proper triggers for profile and leave balance creation
    - Add proper foreign key constraint to auth.users

  2. Security
    - Maintain RLS policies
    - Ensure proper user profile creation flow
*/

-- Drop the existing foreign key constraint that references the non-existent users table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add proper foreign key constraint to auth.users
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

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
  
  -- Create initial leave balance
  INSERT INTO public.leave_balances (user_id, sick, vacation, personal)
  VALUES (NEW.id, 10, 15, 5);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();