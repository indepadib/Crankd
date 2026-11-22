-- SECURITY P0: public INSERT policy previously allowed forged author_id.
-- Apply via reviewed Supabase migration only; not automatically applied to production.
BEGIN;
DROP POLICY IF EXISTS "Authors can create posts" ON public.posts;
CREATE POLICY "Authors can create posts"
ON public.posts FOR INSERT TO authenticated
WITH CHECK (author_id = (select auth.uid()));
COMMIT;

-- Verification after deployment:
-- SELECT policyname,roles,with_check FROM pg_policies
-- WHERE schemaname='public' AND tablename='posts' AND cmd='INSERT';
-- Expected: authenticated role, author_id = auth.uid().
-- Test as anon: INSERT denied. Test as user A author_id=B: denied.
-- Test as user A author_id=A: allowed (provided other constraints satisfied).
