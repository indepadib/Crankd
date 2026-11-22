-- Morocco garage: maintenance history is private to the vehicle owner.
-- Existing policies permitted public reads and unrestricted inserts.
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Logs are public" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Users can delete own logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Users can insert logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Users can update own logs" ON public.maintenance_logs;

CREATE POLICY "Owner views maintenance logs" ON public.maintenance_logs
  FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid())=performed_by_user_id
    AND EXISTS (SELECT 1 FROM public.vehicles v
      WHERE v.id=vehicle_id AND v.owner_id=(SELECT auth.uid()))
  );
CREATE POLICY "Owner inserts maintenance logs" ON public.maintenance_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid())=performed_by_user_id AND is_verified = false
    AND EXISTS (SELECT 1 FROM public.vehicles v
      WHERE v.id=vehicle_id AND v.owner_id=(SELECT auth.uid()))
  );
CREATE POLICY "Owner updates maintenance logs" ON public.maintenance_logs
  FOR UPDATE TO authenticated
  USING (
    (SELECT auth.uid())=performed_by_user_id
    AND EXISTS (SELECT 1 FROM public.vehicles v
      WHERE v.id=vehicle_id AND v.owner_id=(SELECT auth.uid()))
  )
  WITH CHECK (
    (SELECT auth.uid())=performed_by_user_id AND is_verified = false
    AND EXISTS (SELECT 1 FROM public.vehicles v
      WHERE v.id=vehicle_id AND v.owner_id=(SELECT auth.uid()))
  );
CREATE POLICY "Owner deletes maintenance logs" ON public.maintenance_logs
  FOR DELETE TO authenticated
  USING (
    (SELECT auth.uid())=performed_by_user_id
    AND EXISTS (SELECT 1 FROM public.vehicles v
      WHERE v.id=vehicle_id AND v.owner_id=(SELECT auth.uid()))
  );

REVOKE ALL ON public.maintenance_logs FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.maintenance_logs TO authenticated;
GRANT UPDATE (occurred_at,service_type,title,description,cost_amount,cost_currency,odometer_reading)
  ON public.maintenance_logs TO authenticated;
COMMENT ON TABLE public.maintenance_logs IS 'Private owner-only maintenance records. Recorded by the member, not verified by VROOQ. Historical currencies must not be rewritten.';
NOTIFY pgrst, 'reload schema';
