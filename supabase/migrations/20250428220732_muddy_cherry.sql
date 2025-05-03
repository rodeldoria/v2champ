-- Add new fields to user_preferences table
ALTER TABLE IF EXISTS user_preferences
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS favorite_position text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS feedback text;

-- Create index on onboarding_completed for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding ON user_preferences(onboarding_completed);

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