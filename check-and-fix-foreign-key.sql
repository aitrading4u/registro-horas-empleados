-- ============================================
-- VERIFICAR Y ARREGLAR: Foreign Key Constraint
-- ============================================
-- Este SQL verifica el problema y lo soluciona
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver TODOS los usuarios
SELECT id, email, full_name, created_at
FROM users
ORDER BY created_at DESC;

-- Paso 2: Verificar la foreign key constraint
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'organizations'
  AND kcu.column_name = 'created_by';

-- Paso 3: Si la foreign key está causando problemas, podemos hacerla opcional
-- Primero, eliminar la constraint temporalmente
ALTER TABLE organizations 
DROP CONSTRAINT IF EXISTS organizations_created_by_fkey;

-- Paso 4: Crear la organización SIN la foreign key (temporalmente)
INSERT INTO organizations (
  name,
  address,
  latitude,
  longitude,
  allowed_radius,
  timezone,
  created_by
)
SELECT 
  'Restaurante de Prueba',
  'Calle de Prueba, 1, Madrid, España',
  40.4168,
  -3.7038,
  75,
  'Europe/Madrid',
  id  -- Usa el ID del primer usuario
FROM users
ORDER BY created_at ASC
LIMIT 1
RETURNING id, created_by;

-- Paso 5: Agregar el usuario como miembro ADMIN
-- (Usa el ID de la organización que se retornó arriba)
WITH new_org AS (
  SELECT id, created_by
  FROM organizations
  WHERE name = 'Restaurante de Prueba'
  ORDER BY created_at DESC
  LIMIT 1
)
INSERT INTO organization_members (
  organization_id,
  user_id,
  role
)
SELECT 
  new_org.id,
  new_org.created_by,
  'ADMIN'
FROM new_org
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Paso 6: Recrear la foreign key constraint (ahora que los datos son válidos)
ALTER TABLE organizations
ADD CONSTRAINT organizations_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES users(id);

-- Paso 7: Verificar que todo está correcto
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.created_by,
  u.id as user_id,
  u.email,
  u.full_name,
  om.role
FROM organizations o
LEFT JOIN users u ON o.created_by = u.id
LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = u.id
WHERE o.name = 'Restaurante de Prueba'
ORDER BY o.created_at DESC
LIMIT 1;


