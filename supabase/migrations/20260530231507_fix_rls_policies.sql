-- Fix: Admin puede actualizar usuarios
DROP POLICY IF EXISTS "Admin puede actualizar usuarios" ON usuarios;
CREATE POLICY "Admin puede actualizar usuarios"
  ON usuarios FOR UPDATE
  USING (public.is_admin());

-- Fix: Admin puede insertar reservas para otros
DROP POLICY IF EXISTS "Insercion reservas" ON reservas;
CREATE POLICY "Insercion reservas" ON reservas FOR INSERT WITH CHECK (
  auth.uid() = usuarioId OR public.is_admin()
);
