-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'phone_screen', 'onsite', 'offer', 'rejected')),
  date_applied DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  next_steps TEXT,
  next_steps_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contacts table for people at companies
CREATE TABLE public.application_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_applications
CREATE POLICY "Users can view their own applications"
ON public.job_applications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.job_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
ON public.job_applications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
ON public.job_applications FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for application_contacts (through application ownership)
CREATE POLICY "Users can view contacts for their applications"
ON public.application_contacts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.job_applications
  WHERE id = application_contacts.application_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create contacts for their applications"
ON public.application_contacts FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.job_applications
  WHERE id = application_contacts.application_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update contacts for their applications"
ON public.application_contacts FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.job_applications
  WHERE id = application_contacts.application_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete contacts for their applications"
ON public.application_contacts FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.job_applications
  WHERE id = application_contacts.application_id AND user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();