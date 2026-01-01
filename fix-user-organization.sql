-- ============================================
-- SOLUCIÓN: Crear organización para usuario existente
-- ============================================
-- Este SQL crea la organización y agrega al usuario como ADMIN
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Crear la organización y obtener su ID
WITH new_org AS (
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
    id  -- Usa el ID del primer usuario (o el que necesites)
  FROM users
  WHERE email = 'aitrading4u@icloud.com'  -- Cambia por el email de tu usuario
  LIMIT 1
  RETURNING id, created_by
)
-- Paso 2: Agregar el usuario como miembro ADMIN
INSERT INTO organization_members (
  organization_id,
  user_id,
  role
)
SELECT 
  new_org.id,
  new_org.created_by,
  'ADMIN'
FROM new_org;

-- Paso 3: Verificar que se creó correctamente
SELECT 
  o.id as org_id,
  o.name as org_name,
  u.id as user_id,
  u.email,
  u.full_name,
  om.role
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id
JOIN users u ON om.user_id = u.id
WHERE u.email = 'aitrading4u@icloud.com';  -- Cambia por el email de tu usuario

