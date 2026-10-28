-- TRUNCATE bypasses row-level security. Neither app role needs it.
revoke truncate on table public.universal_captures from public, anon, authenticated;
