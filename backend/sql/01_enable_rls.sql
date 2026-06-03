-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================
-- This SQL file enables Row-Level Security on all tables to prevent 
-- unauthorized access to sensitive data.
--
-- Run this in your Supabase SQL Editor:
-- 1. Go to https://app.supabase.com/project/[YOUR-PROJECT-ID]/sql/new
-- 2. Copy and paste the entire contents of this file
-- 3. Click "Run" to execute
--
-- TABLES SECURED:
-- - auth.users (sensitive credentials)
-- - public.core_user (Django user table)
-- - public.core_locker (locker data)
-- - public.core_reservation (reservation data)
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_locker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_reservation ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: DROP EXISTING POLICIES (if any exist from previous attempts)
-- ============================================================================

DROP POLICY IF EXISTS "block_auth_users" ON auth.users;
DROP POLICY IF EXISTS "block_anon_core_user" ON public.core_user;
DROP POLICY IF EXISTS "block_anon_lockers" ON public.core_locker;
DROP POLICY IF EXISTS "block_anon_reservations" ON public.core_reservation;
DROP POLICY IF EXISTS "auth_read_lockers" ON public.core_locker;
DROP POLICY IF EXISTS "auth_read_own_reservations" ON public.core_reservation;
DROP POLICY IF EXISTS "block_direct_writes_lockers" ON public.core_locker;
DROP POLICY IF EXISTS "block_direct_writes_reservations" ON public.core_reservation;

-- ============================================================================
-- STEP 3: BLOCK ALL ACCESS TO auth.users TABLE
-- ============================================================================
-- Django uses its own user table (core_user), so auth.users should be private
-- This prevents exposure of password hashes and sensitive user data

CREATE POLICY "block_all_auth_users" ON auth.users
FOR ALL
TO public
USING (false)
WITH CHECK (false);

-- ============================================================================
-- STEP 4: BLOCK ANONYMOUS ACCESS TO CUSTOM TABLES
-- ============================================================================
-- Unauthenticated users cannot access any data
-- All requests must include valid JWT token from Django

CREATE POLICY "block_anon_on_core_user" ON public.core_user
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "block_anon_on_core_locker" ON public.core_locker
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "block_anon_on_core_reservation" ON public.core_reservation
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- ============================================================================
-- STEP 5: ALLOW AUTHENTICATED USERS TO READ LOCKERS (READ-ONLY)
-- ============================================================================
-- All authenticated users can view available lockers
-- Only Django backend (via backend service account) can create/edit/delete

CREATE POLICY "authenticated_read_lockers" ON public.core_locker
FOR SELECT
TO authenticated
USING (true);

-- Block direct inserts to lockers table
CREATE POLICY "block_insert_lockers" ON public.core_locker
FOR INSERT
TO authenticated
USING (false)
WITH CHECK (false);

-- Block direct updates to lockers table
CREATE POLICY "block_update_lockers" ON public.core_locker
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Block direct deletes from lockers table
CREATE POLICY "block_delete_lockers" ON public.core_locker
FOR DELETE
TO authenticated
USING (false)
WITH CHECK (false);

-- ============================================================================
-- STEP 6: ALLOW AUTHENTICATED USERS TO READ OWN RESERVATIONS ONLY
-- ============================================================================
-- Users can only view reservations they created
-- Admins (handled by Django backend) can view all
-- Only Django backend can create/edit/delete

CREATE POLICY "authenticated_read_own_reservations" ON public.core_reservation
FOR SELECT
TO authenticated
USING (auth.uid() = "user_id");

-- Block direct inserts to reservations table
CREATE POLICY "block_insert_reservations" ON public.core_reservation
FOR INSERT
TO authenticated
USING (false)
WITH CHECK (false);

-- Block direct updates to reservations table
CREATE POLICY "block_update_reservations" ON public.core_reservation
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Block direct deletes from reservations table
CREATE POLICY "block_delete_reservations" ON public.core_reservation
FOR DELETE
TO authenticated
USING (false)
WITH CHECK (false);

-- ============================================================================
-- STEP 7: ALLOW BACKEND SERVICE ACCOUNT FULL ACCESS
-- ============================================================================
-- Django backend connects with service_role key and needs full access
-- All data modifications go through Django REST Framework

-- Create role for backend service account if it doesn't exist
-- Note: This is typically handled by Supabase automatically

-- Grant permissions to service role
GRANT ALL PRIVILEGES ON auth.users TO postgres;
GRANT ALL PRIVILEGES ON public.core_user TO postgres;
GRANT ALL PRIVILEGES ON public.core_locker TO postgres;
GRANT ALL PRIVILEGES ON public.core_reservation TO postgres;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify RLS is properly configured:
--
-- 1. Check if RLS is enabled on tables:
--    SELECT tablename, rowsecurity FROM pg_tables 
--    WHERE tablename IN ('users', 'core_user', 'core_locker', 'core_reservation');
--
-- 2. Check all policies:
--    SELECT schemaname, tablename, policyname, permissive, cmd 
--    FROM pg_policies 
--    ORDER BY schemaname, tablename;
--
-- 3. Test anonymous access (should fail):
--    SELECT * FROM core_locker;
--
-- ============================================================================
