alter table public.editorial_entries
  drop constraint if exists editorial_entries_entry_status_check;

alter table public.editorial_entries
  add constraint editorial_entries_entry_status_check
  check (entry_status in ('draft', 'stored', 'ready_for_enrichment', 'enriched', 'linked', 'published', 'archived'));
