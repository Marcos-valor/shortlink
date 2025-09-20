/*
  # Crear tabla de URLs acortadas

  1. Nuevas Tablas
    - `urls`
      - `id` (uuid, clave primaria)
      - `original_url` (text, URL original)
      - `short_code` (text, código corto único)
      - `custom_alias` (text, alias personalizado opcional)
      - `user_id` (uuid, referencia al usuario, opcional)
      - `clicks` (integer, contador de clicks)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en tabla `urls`
    - Política para que usuarios autenticados puedan leer sus propias URLs
    - Política para que cualquiera pueda crear URLs (incluso anónimos)
    - Política para que cualquiera pueda leer URLs por short_code (para redirección)

  3. Índices
    - Índice único en short_code para búsquedas rápidas
    - Índice en user_id para consultas de historial
*/

-- Crear tabla de URLs
CREATE TABLE IF NOT EXISTS urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url text NOT NULL,
  short_code text UNIQUE NOT NULL,
  custom_alias text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;

-- Política para que cualquiera pueda crear URLs (incluso usuarios anónimos)
CREATE POLICY "Anyone can create URLs"
  ON urls
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política para que cualquiera pueda leer URLs por short_code (necesario para redirección)
CREATE POLICY "Anyone can read URLs by short_code"
  ON urls
  FOR SELECT
  TO public
  USING (true);

-- Política para que usuarios autenticados puedan ver sus propias URLs
CREATE POLICY "Users can view own URLs"
  ON urls
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para que usuarios autenticados puedan actualizar sus propias URLs
CREATE POLICY "Users can update own URLs"
  ON urls
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para que usuarios autenticados puedan eliminar sus propias URLs
CREATE POLICY "Users can delete own URLs"
  ON urls
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_urls_created_at ON urls(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_urls_updated_at
  BEFORE UPDATE ON urls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();