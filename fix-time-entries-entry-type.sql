-- ============================================
-- SOLUCIÓN: Corregir columna entry_type en time_entries
-- ============================================
-- Este SQL verifica y corrige la estructura de la tabla time_entries
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver la estructura actual de la tabla time_entries
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 2: Verificar si existe entry_type o type
DO $$
DECLARE
  has_entry_type BOOLEAN;
  has_type BOOLEAN;
BEGIN
  -- Verificar si existe entry_type
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'entry_type'
    AND table_schema = 'public'
  ) INTO has_entry_type;
  
  -- Verificar si existe type
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'type'
    AND table_schema = 'public'
  ) INTO has_type;
  
  -- Si existe entry_type pero no type, renombrar entry_type a type
  IF has_entry_type AND NOT has_type THEN
    ALTER TABLE time_entries RENAME COLUMN entry_type TO type;
    RAISE NOTICE 'Columna entry_type renombrada a type';
  ELSIF has_type AND NOT has_entry_type THEN
    RAISE NOTICE 'Columna type ya existe, no se necesita renombrar';
  ELSIF has_entry_type AND has_type THEN
    -- Si ambas existen, eliminar entry_type y mantener type
    ALTER TABLE time_entries DROP COLUMN entry_type;
    RAISE NOTICE 'Columna entry_type eliminada (type ya existe)';
  ELSE
    -- Si ninguna existe, crear type
    ALTER TABLE time_entries ADD COLUMN type TEXT NOT NULL DEFAULT 'ENTRY';
    RAISE NOTICE 'Columna type creada';
  END IF;
  
  -- Asegurar que el constraint existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'time_entries_type_check'
  ) THEN
    ALTER TABLE time_entries 
    ADD CONSTRAINT time_entries_type_check 
    CHECK (type IN ('ENTRY', 'EXIT'));
    RAISE NOTICE 'Constraint time_entries_type_check agregado';
  ELSE
    RAISE NOTICE 'Constraint time_entries_type_check ya existe';
  END IF;
END $$;

-- Paso 3: Verificar que todas las columnas necesarias están presentes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 4: Actualizar el schema cache de Supabase (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';

