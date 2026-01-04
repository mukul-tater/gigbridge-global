-- Fix: Remove the overly permissive policy that exposes all user profiles
-- The existing policies for owner access, admin access, and employer-applicant access are sufficient

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;