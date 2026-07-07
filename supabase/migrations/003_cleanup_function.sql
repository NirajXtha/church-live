-- Daily cleanup: delete recordings older than 15 days
create or replace function cleanup_expired_recordings()
returns void
language plpgsql security definer
as $$
declare
  rec record;
begin
  update streams
  set recording_url = null,
      recording_expires_at = null
  where recording_expires_at is not null
    and recording_expires_at < now();
  raise notice 'Cleaned up expired recordings at %', now();
end;
$$;
