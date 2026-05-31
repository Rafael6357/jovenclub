-- Public board: allow public SELECT on usuarios (only id, nombre needed)
DROP POLICY IF EXISTS "P?blico puede ver usuarios" ON usuarios;
CREATE POLICY "P?blico puede ver usuarios"
  ON usuarios FOR SELECT
  USING (true);
