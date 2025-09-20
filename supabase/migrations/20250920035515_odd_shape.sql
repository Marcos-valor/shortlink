/*
  # Función para incrementar clicks

  1. Función SQL
    - `increment_clicks` - Incrementa el contador de clicks de una URL por su short_code
    
  2. Seguridad
    - Función accesible públicamente (necesaria para redirecciones anónimas)
*/

-- Función para incrementar clicks de forma atómica
CREATE OR REPLACE FUNCTION increment_clicks(short_code text)
RETURNS void AS $$
BEGIN
  UPDATE urls 
  SET clicks = clicks + 1, updated_at = now()
  WHERE urls.short_code = increment_clicks.short_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;