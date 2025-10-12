-- Create profiles table for business information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  industry TEXT NOT NULL,
  business_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create datasets table
CREATE TABLE public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

-- Datasets policies
CREATE POLICY "Users can view their own datasets"
  ON public.datasets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own datasets"
  ON public.datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets"
  ON public.datasets FOR DELETE
  USING (auth.uid() = user_id);

-- Create business_insights table
CREATE TABLE public.business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  problem_statement TEXT NOT NULL,
  insights_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_insights ENABLE ROW LEVEL SECURITY;

-- Business insights policies
CREATE POLICY "Users can view their own insights"
  ON public.business_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON public.business_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create ad_content table
CREATE TABLE public.ad_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES public.business_insights(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'linkedin')),
  ad_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'posted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.ad_content ENABLE ROW LEVEL SECURITY;

-- Ad content policies
CREATE POLICY "Users can view their own ad content"
  ON public.ad_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ad content"
  ON public.ad_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ad content"
  ON public.ad_content FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function for auto-updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, business_name, owner_name, email, industry, business_description)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business'),
    COALESCE(NEW.raw_user_meta_data->>'owner_name', 'Owner'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'industry', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'business_description', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();