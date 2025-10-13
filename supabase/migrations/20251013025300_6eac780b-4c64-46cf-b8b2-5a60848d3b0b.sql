-- Add LinkedIn and Instagram API keys to profiles table
ALTER TABLE public.profiles
ADD COLUMN linkedin_api_key TEXT,
ADD COLUMN instagram_api_key TEXT;