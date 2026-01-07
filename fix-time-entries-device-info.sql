-- ============================================
-- SOLUCIÓN: Agregar columna device_info a time_entries
-- ============================================
-- Este SQL agrega la columna device_info que falta en la tabla time_entries
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver la estructura actual de la tabla time_entries
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 2: Verificar y agregar TODAS las columnas que faltan
DO $$
BEGIN
  -- Verificar y agregar type si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'type'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN type TEXT NOT NULL DEFAULT 'ENTRY';
    RAISE NOTICE 'Columna type agregada';
  ELSE
    RAISE NOTICE 'Columna type ya existe';
  END IF;
  
  -- Agregar constraint si no existe (verificar primero)
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
  
  -- Verificar y agregar latitude si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'latitude'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN latitude DECIMAL(10, 8);
    RAISE NOTICE 'Columna latitude agregada';
  ELSE
    RAISE NOTICE 'Columna latitude ya existe';
  END IF;
  
  -- Verificar y agregar longitude si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'longitude'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN longitude DECIMAL(11, 8);
    RAISE NOTICE 'Columna longitude agregada';
  ELSE
    RAISE NOTICE 'Columna longitude ya existe';
  END IF;
  
  -- Verificar y agregar device_info si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'device_info'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE time_entries ADD COLUMN device_info TEXT;
    RAISE NOTICE 'Columna device_info agregada';
  ELSE
    RAISE NOTICE 'Columna device_info ya existe';
  END IF;
END $$;

-- Paso 3: Verificar que todas las columnas están presentes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 4: Actualizar el schema cache de Supabase (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';

