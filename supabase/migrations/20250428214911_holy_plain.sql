/*
  # Add onboarding fields to user preferences

  1. Updates
    - Add `onboarding_completed` boolean field to user_preferences
    - Add `username` text field to user_preferences
    - Add `favorite_position` text field to user_preferences
    - Add `experience_level` text field to user_preferences
    - Add `feedback` text field to user_preferences

  2. Security
    - Maintain existing RLS policies
*/

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