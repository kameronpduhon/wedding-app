-- Performance & Security Fixes Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- SECURITY FIX: handle_new_user search_path
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Fix: explicitly set search_path
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

-- ============================================
-- PERFORMANCE FIX: Wrap auth.uid() in (select ...)
-- This makes the function evaluate once per query, not per row
-- ============================================

-- === PROFILES ===

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING ((select auth.uid()) = id);

-- === WEDDINGS ===

DROP POLICY IF EXISTS "Users can view own weddings" ON public.weddings;
CREATE POLICY "Users can view own weddings" 
  ON public.weddings FOR SELECT 
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create weddings" ON public.weddings;
CREATE POLICY "Users can create weddings" 
  ON public.weddings FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own weddings" ON public.weddings;
CREATE POLICY "Users can update own weddings" 
  ON public.weddings FOR UPDATE 
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own weddings" ON public.weddings;
CREATE POLICY "Users can delete own weddings" 
  ON public.weddings FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- === VENDORS ===

DROP POLICY IF EXISTS "Users can view own vendors" ON public.vendors;
CREATE POLICY "Users can view own vendors" 
  ON public.vendors FOR SELECT 
  USING (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create vendors" ON public.vendors;
CREATE POLICY "Users can create vendors" 
  ON public.vendors FOR INSERT 
  WITH CHECK (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own vendors" ON public.vendors;
CREATE POLICY "Users can update own vendors" 
  ON public.vendors FOR UPDATE 
  USING (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own vendors" ON public.vendors;
CREATE POLICY "Users can delete own vendors" 
  ON public.vendors FOR DELETE 
  USING (
    wedding_id IN (
      SELECT id FROM public.weddings WHERE user_id = (select auth.uid())
    )
  );

-- === REQUESTS ===

DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
CREATE POLICY "Users can view own requests" 
  ON public.requests FOR SELECT 
  USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      JOIN public.weddings w ON v.wedding_id = w.id
      WHERE w.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
CREATE POLICY "Users can create requests" 
  ON public.requests FOR INSERT 
  WITH CHECK (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      JOIN public.weddings w ON v.wedding_id = w.id
      WHERE w.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own requests" ON public.requests;
CREATE POLICY "Users can update own requests" 
  ON public.requests FOR UPDATE 
  USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      JOIN public.weddings w ON v.wedding_id = w.id
      WHERE w.user_id = (select auth.uid())
    )
  );

-- === RESPONSES ===

DROP POLICY IF EXISTS "Users can view responses to their requests" ON public.responses;
CREATE POLICY "Users can view responses to their requests" 
  ON public.responses FOR SELECT 
  USING (
    request_id IN (
      SELECT r.id FROM public.requests r
      JOIN public.vendors v ON r.vendor_id = v.id
      JOIN public.weddings w ON v.wedding_id = w.id
      WHERE w.user_id = (select auth.uid())
    )
  );

-- === FILES ===

DROP POLICY IF EXISTS "Users can view files from their responses" ON public.files;
CREATE POLICY "Users can view files from their responses" 
  ON public.files FOR SELECT 
  USING (
    response_id IN (
      SELECT resp.id FROM public.responses resp
      JOIN public.requests req ON resp.request_id = req.id
      JOIN public.vendors v ON req.vendor_id = v.id
      JOIN public.weddings w ON v.wedding_id = w.id
      WHERE w.user_id = (select auth.uid())
    )
  );
