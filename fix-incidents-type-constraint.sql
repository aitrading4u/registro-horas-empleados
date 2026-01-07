-- ============================================
-- SOLUCIÓN: Actualizar check constraint de incidents.type
-- ============================================
-- Este SQL actualiza el check constraint para que coincida con los valores del código
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Eliminar el constraint antiguo
ALTER TABLE incidents
DROP CONSTRAINT IF EXISTS incidents_type_check;

-- Paso 2: Crear el constraint nuevo con los valores correctos
ALTER TABLE incidents
ADD CONSTRAINT incidents_type_check 
CHECK (type IN ('FORGOT_ENTRY', 'LATE_ARRIVAL', 'NOT_WORKING'));

-- Paso 3: Verificar que el constraint se creó correctamente
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'incidents_type_check';

-- Paso 4: Actualizar el schema cache de Supabase
NOTIFY pgrst, 'reload schema';


