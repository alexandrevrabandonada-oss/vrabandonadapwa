-- Add preferred format to share packs for export circulation

ALTER TABLE public.share_packs
  ADD COLUMN IF NOT EXISTS preferred_format text NOT NULL DEFAULT 'both';

UPDATE public.share_packs
SET preferred_format = 'both'
WHERE preferred_format IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'share_packs_preferred_format_check'
      AND conrelid = 'public.share_packs'::regclass
  ) THEN
    ALTER TABLE public.share_packs
      ADD CONSTRAINT share_packs_preferred_format_check
      CHECK (preferred_format IN ('square', 'vertical', 'both'));
  END IF;
END $$;
