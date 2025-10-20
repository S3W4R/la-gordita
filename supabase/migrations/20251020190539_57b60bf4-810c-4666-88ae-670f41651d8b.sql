-- Add missing UPDATE policy for gallery table
CREATE POLICY "Admins can update gallery images"
ON public.gallery
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));