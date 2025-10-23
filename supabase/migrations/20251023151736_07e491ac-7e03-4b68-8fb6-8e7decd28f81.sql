-- Add webhook_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS webhook_url TEXT;

-- Drop linkedin_api_key and instagram_api_key columns
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS linkedin_api_key,
DROP COLUMN IF EXISTS instagram_api_key;

-- Update the handle_new_user function to use webhook_url
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, owner_name, email, industry, business_description, webhook_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    COALESCE(NEW.raw_user_meta_data->>'owner_name', 'Owner'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'industry', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'business_description', ''),
    NEW.raw_user_meta_data->>'webhook_url'
  );
  RETURN NEW;
END;
$$;