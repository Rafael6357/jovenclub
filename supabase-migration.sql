-- ============================================================
-- COMUNICA-JC: Esquema de base de datos para Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard -> SQL Editor
-- ============================================================

-- Eliminar tablas existentes (ambos naming) para forzar esquema correcto
DROP TABLE IF EXISTS "colaSincronizacion" CASCADE;
DROP TABLE IF EXISTS colasincronizacion CASCADE;
DROP TABLE IF EXISTS "eventosReserva" CASCADE;
DROP TABLE IF EXISTS eventosreserva CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;
DROP TABLE IF EXISTS "lecturasAnuncio" CASCADE;
DROP TABLE IF EXISTS lecturasanuncio CASCADE;
DROP TABLE IF EXISTS adjuntos CASCADE;
DROP TABLE IF EXISTS anuncios CASCADE;
DROP TABLE IF EXISTS "solicitudesCambio" CASCADE;
DROP TABLE IF EXISTS solicitudescambio CASCADE;
DROP TABLE IF EXISTS horarios CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- 1. ROLES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos pueden leer roles" ON roles;
CREATE POLICY "Todos pueden leer roles" ON roles FOR SELECT USING (true);

INSERT INTO roles (id, nombre, descripcion) VALUES
  ('admin', 'Administrador', 'Gestión total del sistema'),
  ('instructor', 'Instructor', 'Uso básico del sistema')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 2. USUARIOS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT DEFAULT '',
  rolId TEXT REFERENCES roles(id) DEFAULT 'instructor',
  fotoURL TEXT DEFAULT ''
);

-- ═══════════════════════════════════════════════════════════════
-- FUNCIÓN AUXILIAR: is_admin()
-- Debe crearse después de usuarios para poder referenciarla.
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rolId = 'admin');
$$;

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden leer su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden leer su propio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin puede leer todos los usuarios" ON usuarios;
CREATE POLICY "Admin puede leer todos los usuarios"
  ON usuarios FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden insertar su propio perfil"
  ON usuarios FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin puede actualizar usuarios" ON usuarios;
CREATE POLICY "Admin puede actualizar usuarios"
  ON usuarios FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Público puede ver usuarios" ON usuarios;
CREATE POLICY "Público puede ver usuarios"
  ON usuarios FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin puede eliminar usuarios" ON usuarios;
CREATE POLICY "Admin puede eliminar usuarios"
  ON usuarios FOR DELETE
  USING (
    public.is_admin()       -- solo admin puede borrar
    AND auth.uid() != id    -- no puede eliminarse a sí mismo
  );

-- ═══════════════════════════════════════════════════════════════
-- 3. HORARIOS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS horarios (
  id TEXT PRIMARY KEY,
  usuarioId UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  diaSemana INTEGER NOT NULL,
  horaInicio TEXT NOT NULL,
  horaFin TEXT NOT NULL,
  validoDesde TEXT NOT NULL,
  validoHasta TEXT NOT NULL
);

ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura horarios" ON horarios;
CREATE POLICY "Lectura horarios" ON horarios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin escribe horarios" ON horarios;
CREATE POLICY "Admin escribe horarios" ON horarios FOR ALL USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════
-- 4. SOLICITUDES CAMBIO TURNO
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "solicitudesCambio" (
  id TEXT PRIMARY KEY,
  solicitanteId UUID NOT NULL REFERENCES usuarios(id),
  reemplazanteId UUID REFERENCES usuarios(id),
  fechaSolicitud TEXT NOT NULL,
  turnoOriginal TEXT NOT NULL,
  turnoPropuesto TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  motivo TEXT DEFAULT ''
);

ALTER TABLE "solicitudesCambio" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura cambios" ON "solicitudesCambio";
CREATE POLICY "Lectura cambios" ON "solicitudesCambio" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion cambios" ON "solicitudesCambio";
CREATE POLICY "Insercion cambios" ON "solicitudesCambio" FOR INSERT WITH CHECK (auth.uid() = solicitanteId);

DROP POLICY IF EXISTS "Admin actualiza cambios" ON "solicitudesCambio";
CREATE POLICY "Admin actualiza cambios" ON "solicitudesCambio" FOR UPDATE USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════
-- 5. ANUNCIOS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS anuncios (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  fechaPublicacion TEXT NOT NULL,
  fechaExpiracion TEXT NOT NULL,
  autorId UUID NOT NULL REFERENCES usuarios(id)
);

ALTER TABLE anuncios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura anuncios" ON anuncios;
CREATE POLICY "Lectura anuncios" ON anuncios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin escribe anuncios" ON anuncios;
CREATE POLICY "Admin escribe anuncios" ON anuncios FOR ALL USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════
-- 6. ADJUNTOS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS adjuntos (
  id TEXT PRIMARY KEY,
  anuncioId TEXT NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  nombreArchivo TEXT NOT NULL,
  tipoMime TEXT NOT NULL,
  tamanoBytes INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE adjuntos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura adjuntos" ON adjuntos;
CREATE POLICY "Lectura adjuntos" ON adjuntos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin escribe adjuntos" ON adjuntos;
CREATE POLICY "Admin escribe adjuntos" ON adjuntos FOR ALL USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════
-- 7. LECTURAS ANUNCIO
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "lecturasAnuncio" (
  anuncioId TEXT NOT NULL REFERENCES anuncios(id) ON DELETE CASCADE,
  usuarioId UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fechaLectura TEXT NOT NULL,
  PRIMARY KEY (anuncioId, usuarioId)
);

ALTER TABLE "lecturasAnuncio" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura lecturas" ON "lecturasAnuncio";
CREATE POLICY "Lectura lecturas" ON "lecturasAnuncio" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion lecturas" ON "lecturasAnuncio";
CREATE POLICY "Insercion lecturas" ON "lecturasAnuncio" FOR INSERT WITH CHECK (auth.uid() = usuarioId);

-- ═══════════════════════════════════════════════════════════════
-- 8. RECURSOS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS recursos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  disponible BOOLEAN DEFAULT true
);

ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura recursos" ON recursos;
CREATE POLICY "Lectura recursos" ON recursos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin escribe recursos" ON recursos;
CREATE POLICY "Admin escribe recursos" ON recursos FOR ALL USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════
-- 9. RESERVAS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reservas (
  id TEXT PRIMARY KEY,
  recursoId TEXT NOT NULL REFERENCES recursos(id),
  usuarioId UUID NOT NULL REFERENCES usuarios(id),
  tituloEvento TEXT NOT NULL,
  fechaInicio TEXT NOT NULL,
  fechaFin TEXT NOT NULL,
  asistentes INTEGER NOT NULL DEFAULT 1,
  estado TEXT NOT NULL DEFAULT 'confirmada'
);

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura reservas" ON reservas;
CREATE POLICY "Lectura reservas" ON reservas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion reservas" ON reservas;
CREATE POLICY "Insercion reservas" ON reservas FOR INSERT WITH CHECK (
  auth.uid() = usuarioId OR public.is_admin()
);

DROP POLICY IF EXISTS "Actualizacion reservas" ON reservas;
CREATE POLICY "Actualizacion reservas" ON reservas FOR UPDATE USING (
  auth.uid() = usuarioId OR public.is_admin()
);

-- ═══════════════════════════════════════════════════════════════
-- 10. EVENTOS RESERVA
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "eventosReserva" (
  id TEXT PRIMARY KEY,
  reservaId TEXT NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  fechaRegistro TEXT NOT NULL
);

ALTER TABLE "eventosReserva" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura eventos" ON "eventosReserva";
CREATE POLICY "Lectura eventos" ON "eventosReserva" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura eventos" ON "eventosReserva";
CREATE POLICY "Escritura eventos" ON "eventosReserva" FOR ALL USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════
-- 11. COLA SINCRONIZACION
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS "colaSincronizacion" (
  id TEXT PRIMARY KEY,
  tabla TEXT NOT NULL,
  registroId TEXT NOT NULL,
  accion TEXT NOT NULL,
  datos TEXT NOT NULL,
  fechaCreacion TEXT NOT NULL,
  intentado INTEGER DEFAULT 0,
  lastError TEXT
);

ALTER TABLE "colaSincronizacion" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso cola" ON "colaSincronizacion";
CREATE POLICY "Acceso cola" ON "colaSincronizacion" FOR ALL USING (public.is_admin());
