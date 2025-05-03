/*
  # Add user preferences fields

  1. New Fields
    - `onboarding_completed` (boolean)
    - `username` (text)
    - `favorite_position` (text)
    - `experience_level` (text)
    - `feedback` (text)
  2. Indexes
    - Add index on `onboarding_completed` for faster lookups
  3. Triggers
    - Update trigger function for updated_at
    - Create function to handle new user creation
    - Create trigger for new user signup
*/

-- Add new fields to user_preferences table using DO block to check if columns exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE user_preferences ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'username') THEN
    ALTER TABLE user_preferences ADD COLUMN username text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'favorite_position') THEN
    ALTER TABLE user_preferences ADD COLUMN favorite_position text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'experience_level') THEN
    ALTER TABLE user_preferences ADD COLUMN experience_level text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'feedback') THEN
    ALTER TABLE user_preferences ADD COLUMN feedback text;
  END IF;
END $$;

-- Create index on onboarding_completed for faster lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_user_preferences_onboarding'
  ) THEN
    CREATE INDEX idx_user_preferences_onboarding ON user_preferences(onboarding_completed);
  END IF;
END $$;

-- Update trigger function to handle new fields
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, theme, onboarding_completed)
  VALUES (NEW.id, 'light', false);
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Create a trigger to automatically create user preferences when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();