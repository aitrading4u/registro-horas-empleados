-- ============================================
-- SOLUCIÓN: Corregir constraint de entry_type en time_entries
-- ============================================
-- Este SQL verifica y corrige el constraint de entry_type
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver la estructura actual de la tabla time_entries
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 2: Ver los constraints actuales
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'time_entries'::regclass
AND contype = 'c';

-- Paso 3: Eliminar el constraint incorrecto si existe
DO $$
BEGIN
  -- Eliminar time_entries_entry_type_check si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'time_entries_entry_type_check'
  ) THEN
    ALTER TABLE time_entries DROP CONSTRAINT time_entries_entry_type_check;
    RAISE NOTICE 'Constraint time_entries_entry_type_check eliminado';
  ELSE
    RAISE NOTICE 'Constraint time_entries_entry_type_check no existe';
  END IF;
  
  -- Eliminar time_entries_type_check si existe (por si acaso)
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'time_entries_type_check'
  ) THEN
    ALTER TABLE time_entries DROP CONSTRAINT time_entries_type_check;
    RAISE NOTICE 'Constraint time_entries_type_check eliminado';
  END IF;
END $$;

-- Paso 4: Verificar qué columna existe (type o entry_type)
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
  
  -- Si existe entry_type, crear el constraint correcto
  IF has_entry_type THEN
    ALTER TABLE time_entries 
    ADD CONSTRAINT time_entries_entry_type_check 
    CHECK (entry_type IN ('ENTRY', 'EXIT'));
    RAISE NOTICE 'Constraint time_entries_entry_type_check creado para entry_type';
  END IF;
  
  -- Si existe type, crear el constraint correcto
  IF has_type THEN
    ALTER TABLE time_entries 
    ADD CONSTRAINT time_entries_type_check 
    CHECK (type IN ('ENTRY', 'EXIT'));
    RAISE NOTICE 'Constraint time_entries_type_check creado para type';
  END IF;
  
  -- Si ninguna existe, crear type
  IF NOT has_entry_type AND NOT has_type THEN
    ALTER TABLE time_entries ADD COLUMN type TEXT NOT NULL DEFAULT 'ENTRY';
    ALTER TABLE time_entries 
    ADD CONSTRAINT time_entries_type_check 
    CHECK (type IN ('ENTRY', 'EXIT'));
    RAISE NOTICE 'Columna type creada con constraint';
  END IF;
END $$;

-- Paso 5: Verificar que el constraint está correcto
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'time_entries'::regclass
AND contype = 'c';

-- Paso 6: Actualizar el schema cache de Supabase (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';

