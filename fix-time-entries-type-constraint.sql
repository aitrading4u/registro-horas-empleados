-- ============================================
-- SOLUCIÓN: Corregir constraint de type en time_entries
-- ============================================
-- La columna se llama 'type', no 'entry_type'
-- Ejecuta este SQL en Supabase SQL Editor

-- Paso 1: Eliminar el constraint incorrecto si existe
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_entry_type_check;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_type_check;

-- Paso 2: Crear el constraint correcto para la columna 'type'
ALTER TABLE time_entries 
ADD CONSTRAINT time_entries_type_check 
CHECK (type IN ('ENTRY', 'EXIT'));

-- Paso 3: Verificar que el constraint está correcto
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'time_entries'::regclass
AND contype = 'c'
ORDER BY conname;

-- Paso 4: IMPORTANTE - Recargar el schema cache
NOTIFY pgrst, 'reload schema';

