-- Security Fixes Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- FIX: Tighten RLS on requests table
-- Problem: "using (true)" allows anyone to query ALL requests
-- Solution: Remove overly permissive policies, rely on service role for vendor pages
-- ============================================

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view request by token" ON public.requests;
DROP POLICY IF EXISTS "Anyone can update request by token" ON public.requests;

-- The app uses service_role for vendor response pages, so we don't need
-- public anon access. The existing user-based policies are sufficient:
-- - "Users can view own requests" (for authenticated brides)
-- - "Users can create requests" (for authenticated brides)
-- - "Users can update own requests" (for authenticated brides)

-- ============================================
-- FIX: Tighten RLS on responses table
-- Problem: Anyone can insert responses without validation
-- Solution: Still allow inserts (vendors need this), but add basic constraint
-- ============================================

-- Drop and recreate with a check that request_id exists
DROP POLICY IF EXISTS "Anyone can create response" ON public.responses;

-- Allow insert only if the request exists and isn't already completed
-- Note: This is defense-in-depth; the API also validates
CREATE POLICY "Vendors can create response for valid request"
  ON public.responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests 
      WHERE id = request_id 
      AND status != 'completed'
    )
  );

-- ============================================
-- FIX: Tighten RLS on files table
-- Problem: Anyone can insert files without validation
-- Solution: Only allow if response exists
-- ============================================

DROP POLICY IF EXISTS "Anyone can create file" ON public.files;

-- Allow insert only if the response exists
CREATE POLICY "Vendors can upload files for valid response"
  ON public.files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.responses 
      WHERE id = response_id
    )
  );

-- ============================================
-- STORAGE POLICIES (Run in Dashboard > Storage > vendor-files > Policies)
-- ============================================

-- CREATE POLICY: Allow authenticated users to download files
-- Policy name: "Authenticated users can download"
-- Allowed operation: SELECT
-- Target roles: authenticated
-- Policy definition: true
-- (App-level auth already verifies ownership before showing download buttons)

-- CREATE POLICY: Service role only for uploads
-- Policy name: "Service role uploads"
-- Allowed operation: INSERT
-- Target roles: service_role
-- Policy definition: true
