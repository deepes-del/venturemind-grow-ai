-- Update the handle_new_user function to include API keys
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, owner_name, email, industry, business_description, linkedin_api_key, instagram_api_key)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    COALESCE(NEW.raw_user_meta_data->>'owner_name', 'Owner'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'industry', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'business_description', ''),
    NEW.raw_user_meta_data->>'linkedin_api_key',
    NEW.raw_user_meta_data->>'instagram_api_key'
  );
  RETURN NEW;
END;
$$;