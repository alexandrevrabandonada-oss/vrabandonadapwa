\set ON_ERROR_STOP on
set role service_role;
insert into storage.objects(bucket_id,name) values ('editorial-private','synthetic.pdf');
insert into public.private_editorial_documents(id,capture_id,object_path,mime_type,byte_size,origin,purpose,created_by)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','synthetic.pdf','application/pdf',8,'captura','revisão','cccccccc-cccc-4ccc-8ccc-cccccccccccc');
reset role;
do $$ begin
  if (select public from storage.buckets where id='editorial-private') then raise exception 'bucket is public'; end if;
  if (select count(*) from public.private_document_events where action='uploaded') <> 1 then raise exception 'audit event missing'; end if;
end $$;
set role anon;
do $$ declare n integer; begin
  select count(*) into n from storage.objects where bucket_id='editorial-private';
  if n <> 0 then raise exception 'anon read private objects'; end if;
  begin insert into storage.objects(bucket_id,name) values ('editorial-private','attack'); raise exception 'anon uploaded';
  exception when insufficient_privilege then null; end;
  begin perform 1 from public.private_editorial_documents; raise exception 'anon read metadata';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
do $$ declare n integer; begin
  select count(*) into n from storage.objects where bucket_id='editorial-private';
  if n <> 0 then raise exception 'authenticated read private objects'; end if;
  begin insert into storage.objects(bucket_id,name) values ('editorial-private','attack'); raise exception 'authenticated uploaded';
  exception when insufficient_privilege then null; end;
  begin perform 1 from public.private_editorial_documents; raise exception 'authenticated read metadata';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'isolated private storage RLS tests passed' as result;
