-- Seed the internal allowlist with the project owner's editor email.
insert into public.admin_email_allowlist (email)
values ('alexandrecampos@id.uff.br')
on conflict (email) do nothing;
