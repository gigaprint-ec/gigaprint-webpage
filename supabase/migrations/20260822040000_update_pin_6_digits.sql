-- =========================================================================================
-- MIGRATION: 20260822040000_update_pin_6_digits.sql
-- DESCRIPTION: Actualización del estándar de PIN de 4 a 6 dígitos para seguridad de caja POS.
-- =========================================================================================

ALTER TABLE IF EXISTS public.pos_advisors 
  ALTER COLUMN pin TYPE VARCHAR(6),
  ALTER COLUMN weekly_pin TYPE VARCHAR(6);

-- Comentario descriptivo de seguridad
COMMENT ON COLUMN public.pos_advisors.pin IS 'PIN maestro de 6 dígitos numéricos para desbloqueo de terminal POS';
COMMENT ON COLUMN public.pos_advisors.weekly_pin IS 'PIN rotativo semanal de 6 dígitos numéricos';

-- Actualización de PINs de demostración a 6 dígitos
UPDATE public.pos_advisors SET pin = '842190', weekly_pin = '842190', weekly_password = 'vicky-842190' WHERE id = 'adv-vicky';
UPDATE public.pos_advisors SET pin = '395214', weekly_pin = '395214', weekly_password = 'karla-395214' WHERE id = 'adv-karla';
UPDATE public.pos_advisors SET pin = '618472', weekly_pin = '618472', weekly_password = 'mariela-618472' WHERE id = 'adv-mariela';
UPDATE public.pos_advisors SET pin = '749153', weekly_pin = '749153', weekly_password = 'karen-749153' WHERE id = 'adv-karen';
UPDATE public.pos_advisors SET pin = '283506', weekly_pin = '283506', weekly_password = 'amy-283506' WHERE id = 'adv-amy';
UPDATE public.pos_advisors SET pin = '916328', weekly_pin = '916328', weekly_password = 'fernando-916328' WHERE id = 'adv-fernando';
UPDATE public.pos_advisors SET pin = '530841', weekly_pin = '530841', weekly_password = 'ventas-530841' WHERE id = 'adv-otros';
