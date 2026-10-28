\set ON_ERROR_STOP on
set role anon;
do $$ begin
  begin perform 1 from public.admin_email_allowlist; raise exception 'anon read allowlist allowed';
  exception when insufficient_privilege then null; end;
  begin insert into public.admin_email_allowlist(email) values ('intruder@example.invalid'); raise exception 'anon wrote allowlist';
  exception when insufficient_privilege then null; end;
  begin perform 1 from public.intake_submissions; raise exception 'anon read submissions';
  exception when insufficient_privilege then null; end;
  begin truncate public.intake_submissions; raise exception 'anon truncated submissions';
  exception when insufficient_privilege then null; end;
  begin truncate public.universal_captures; raise exception 'anon truncated captures';
  exception when insufficient_privilege then null; end;
  insert into public.intake_submissions(category,title,details,status) values ('pauta','teste','conteudo ficticio','new');
  begin insert into public.intake_submissions(category,title,details,status) values ('pauta','teste','x','published'); raise exception 'invalid status accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
select set_config('request.jwt.claims', '{"email":"other@example.invalid"}', false);
do $$ declare n integer; begin
  select count(*) into n from public.intake_submissions;
  if n <> 0 then raise exception 'non-admin read submissions'; end if;
  select count(*) into n from public.universal_captures;
  if n <> 0 then raise exception 'non-admin read captures'; end if;
  update public.intake_submissions set status='reviewing';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'non-admin updated submissions'; end if;
  begin insert into public.admin_email_allowlist(email) values ('other@example.invalid'); raise exception 'authenticated wrote allowlist';
  exception when insufficient_privilege then null; end;
  begin truncate public.universal_captures; raise exception 'authenticated truncated captures';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims', '{"email":"admin@example.invalid"}', false);
do $$ declare n integer; begin
  select count(*) into n from public.intake_submissions;
  if n <> 1 then raise exception 'admin cannot read submissions'; end if;
  select count(*) into n from public.universal_captures;
  if n <> 1 then raise exception 'admin cannot read captures'; end if;
  update public.intake_submissions set status='reviewing';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'admin cannot update submissions'; end if;
end $$;
reset role;
select 'isolated RLS tests passed' as result;
