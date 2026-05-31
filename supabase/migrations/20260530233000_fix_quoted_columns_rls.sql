-- Fix RLS policies and is_admin() to use quoted column names
-- (required after camelCase column rename)

-- 1. Fix is_admin() to reference "rolId" with double quotes
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND "rolId" = 'admin');
$$;

-- 2. Drop and recreate all RLS policies using quoted column names

-- Usuarios
DROP POLICY IF EXISTS "Usuarios pueden leer su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden leer su propio perfil" ON usuarios FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin puede leer todos los usuarios" ON usuarios;
CREATE POLICY "Admin puede leer todos los usuarios" ON usuarios FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden insertar su propio perfil" ON usuarios FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin puede actualizar usuarios" ON usuarios;
CREATE POLICY "Admin puede actualizar usuarios" ON usuarios FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Publico puede ver usuarios" ON usuarios;
CREATE POLICY "Publico puede ver usuarios" ON usuarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin puede eliminar usuarios" ON usuarios;
CREATE POLICY "Admin puede eliminar usuarios" ON usuarios FOR DELETE USING (
  public.is_admin() AND auth.uid() != id
);

-- Horarios
DROP POLICY IF EXISTS "Lectura horarios" ON horarios;
CREATE POLICY "Lectura horarios" ON horarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin escribe horarios" ON horarios;
CREATE POLICY "Admin escribe horarios" ON horarios FOR ALL USING (public.is_admin());

-- SolicitudesCambio
DROP POLICY IF EXISTS "Lectura cambios" ON "solicitudesCambio";
CREATE POLICY "Lectura cambios" ON "solicitudesCambio" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion cambios" ON "solicitudesCambio";
CREATE POLICY "Insercion cambios" ON "solicitudesCambio" FOR INSERT WITH CHECK (auth.uid() = "solicitanteId");

DROP POLICY IF EXISTS "Admin actualiza cambios" ON "solicitudesCambio";
CREATE POLICY "Admin actualiza cambios" ON "solicitudesCambio" FOR UPDATE USING (public.is_admin());

-- Anuncios
DROP POLICY IF EXISTS "Lectura anuncios" ON anuncios;
CREATE POLICY "Lectura anuncios" ON anuncios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin escribe anuncios" ON anuncios;
CREATE POLICY "Admin escribe anuncios" ON anuncios FOR ALL USING (public.is_admin());

-- Adjuntos
DROP POLICY IF EXISTS "Lectura adjuntos" ON adjuntos;
CREATE POLICY "Lectura adjuntos" ON adjuntos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin escribe adjuntos" ON adjuntos;
CREATE POLICY "Admin escribe adjuntos" ON adjuntos FOR ALL USING (public.is_admin());

-- LecturasAnuncio
DROP POLICY IF EXISTS "Lectura lecturas" ON "lecturasAnuncio";
CREATE POLICY "Lectura lecturas" ON "lecturasAnuncio" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion lecturas" ON "lecturasAnuncio";
CREATE POLICY "Insercion lecturas" ON "lecturasAnuncio" FOR INSERT WITH CHECK (auth.uid() = "usuarioId");

-- Recursos
DROP POLICY IF EXISTS "Lectura recursos" ON recursos;
CREATE POLICY "Lectura recursos" ON recursos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin escribe recursos" ON recursos;
CREATE POLICY "Admin escribe recursos" ON recursos FOR ALL USING (public.is_admin());

-- Reservas
DROP POLICY IF EXISTS "Lectura reservas" ON reservas;
CREATE POLICY "Lectura reservas" ON reservas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion reservas" ON reservas;
CREATE POLICY "Insercion reservas" ON reservas FOR INSERT WITH CHECK (
  auth.uid() = "usuarioId" OR public.is_admin()
);

DROP POLICY IF EXISTS "Actualizacion reservas" ON reservas;
CREATE POLICY "Actualizacion reservas" ON reservas FOR UPDATE USING (
  auth.uid() = "usuarioId" OR public.is_admin()
);

-- EventosReserva
DROP POLICY IF EXISTS "Lectura eventos" ON "eventosReserva";
CREATE POLICY "Lectura eventos" ON "eventosReserva" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura eventos" ON "eventosReserva";
CREATE POLICY "Escritura eventos" ON "eventosReserva" FOR ALL USING (public.is_admin());

-- ColaSincronizacion
DROP POLICY IF EXISTS "Acceso cola" ON "colaSincronizacion";
CREATE POLICY "Acceso cola" ON "colaSincronizacion" FOR ALL USING (public.is_admin());

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
