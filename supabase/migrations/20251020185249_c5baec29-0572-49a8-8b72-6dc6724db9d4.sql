-- Create theme_settings table
CREATE TABLE public.theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  background_color text NOT NULL DEFAULT '#0d0d0d',
  font_family text NOT NULL DEFAULT 'Poppins',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read theme settings
CREATE POLICY "Anyone can view theme settings"
ON public.theme_settings
FOR SELECT
USING (true);

-- Only admins can update theme settings
CREATE POLICY "Admins can update theme settings"
ON public.theme_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert theme settings
CREATE POLICY "Admins can insert theme settings"
ON public.theme_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default theme settings
INSERT INTO public.theme_settings (background_color, font_family)
VALUES ('#0d0d0d', 'Poppins');

-- Create trigger for updated_at
CREATE TRIGGER update_theme_settings_updated_at
BEFORE UPDATE ON public.theme_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();