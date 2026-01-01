-- ============================================
-- SOLUCIÓN: Eliminar columna reviewed_by y su foreign key
-- ============================================
-- El schema usa approved_by, no reviewed_by
-- Este SQL elimina la columna y constraint incorrectos
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver todas las columnas de incidents
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'incidents'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 2: Eliminar la foreign key constraint incorrecta
ALTER TABLE incidents
DROP CONSTRAINT IF EXISTS incidents_reviewed_by_fkey;

-- Paso 3: Eliminar la columna reviewed_by si existe (no debería existir según el schema)
ALTER TABLE incidents
DROP COLUMN IF EXISTS reviewed_by;

-- Paso 4: Eliminar la columna reviewed_at si existe (no debería existir según el schema)
ALTER TABLE incidents
DROP COLUMN IF EXISTS reviewed_at;

-- Paso 5: Verificar que approved_by y approved_at existen
DO $$
BEGIN
  -- Verificar y agregar approved_by si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' 
    AND column_name = 'approved_by'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE incidents ADD COLUMN approved_by UUID REFERENCES users(id);
    RAISE NOTICE 'Columna approved_by agregada';
  ELSE
    RAISE NOTICE 'Columna approved_by ya existe';
  END IF;
  
  -- Verificar y agregar approved_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' 
    AND column_name = 'approved_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE incidents ADD COLUMN approved_at TIMESTAMPTZ;
    RAISE NOTICE 'Columna approved_at agregada';
  ELSE
    RAISE NOTICE 'Columna approved_at ya existe';
  END IF;
END $$;

-- Paso 6: Verificar todas las foreign keys de incidents
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'incidents'::regclass
AND contype = 'f'
ORDER BY conname;

-- Paso 7: Verificar que todas las columnas están correctas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'incidents'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 8: Actualizar el schema cache de Supabase
NOTIFY pgrst, 'reload schema';

