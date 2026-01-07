-- ============================================
-- SOLUCIÓN SIMPLE: Corregir constraint de entry_type
-- ============================================
-- Ejecuta este SQL en Supabase SQL Editor

-- Paso 1: Ver qué constraints existen
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'time_entries'::regclass
AND contype = 'c'
ORDER BY conname;

-- Paso 2: Eliminar TODOS los constraints de type/entry_type
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_entry_type_check;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_type_check;

-- Paso 3: Verificar qué columna existe
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'time_entries'
AND table_schema = 'public'
AND (column_name = 'type' OR column_name = 'entry_type');

-- Paso 4: Crear el constraint correcto según la columna que existe
-- Si existe entry_type:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'entry_type'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE time_entries 
    ADD CONSTRAINT time_entries_entry_type_check 
    CHECK (entry_type IN ('ENTRY', 'EXIT'));
    RAISE NOTICE '✅ Constraint creado para entry_type';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_entries' 
    AND column_name = 'type'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE time_entries 
    ADD CONSTRAINT time_entries_type_check 
    CHECK (type IN ('ENTRY', 'EXIT'));
    RAISE NOTICE '✅ Constraint creado para type';
  ELSE
    RAISE NOTICE '❌ No se encontró ni type ni entry_type';
  END IF;
END $$;

-- Paso 5: Verificar que el constraint está correcto
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'time_entries'::regclass
AND contype = 'c'
ORDER BY conname;

-- Paso 6: IMPORTANTE - Recargar el schema cache
NOTIFY pgrst, 'reload schema';

