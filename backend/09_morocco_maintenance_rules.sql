-- VROOQ maintenance intelligence. Existing records keep unknown odometer_unit:
-- NEVER silently label historic mile readings as kilometers.
alter table public.maintenance_logs
  add column if not exists service_code text check (char_length(service_code) <= 80),
  add column if not exists odometer_unit text check (odometer_unit in ('km','mi')),
  add column if not exists next_due_km integer check (next_due_km is null or next_due_km >= 0);

alter table public.maintenance_logs
  add constraint maintenance_next_due_after_service
  check (
    next_due_km is null
    or odometer_unit is distinct from 'km'
    or odometer_reading is null
    or next_due_km > odometer_reading
  );

grant update (service_code,odometer_unit,next_due_km) on public.maintenance_logs to authenticated;
comment on column public.maintenance_logs.next_due_km is 'Owner-entered future maintenance milestone, not a manufacturer certified service interval';
comment on column public.maintenance_logs.odometer_unit is 'NULL for historic records with unknown distance unit, never assume kilometers';
notify pgrst, 'reload schema';