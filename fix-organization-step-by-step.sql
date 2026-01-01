-- ============================================
-- SOLUCIÓN PASO A PASO: Crear organización
-- ============================================
-- Ejecuta este SQL paso por paso en Supabase SQL Editor
-- Copia y pega cada sección por separado

-- ============================================
-- PASO 1: Ver TODOS los usuarios con sus IDs EXACTOS
-- ============================================
SELECT 
  id,
  email,
  full_name,
  created_at,
  id::text as id_text
FROM users
ORDER BY created_at DESC;

-- ============================================
-- PASO 2: Copia el ID del usuario de arriba y úsalo aquí
-- Reemplaza 'TU_USER_ID_AQUI' con el ID que viste en el Paso 1
-- ============================================
-- Primero, verifica que el usuario existe
SELECT 
  id,
  email,
  full_name
FROM users
WHERE id = 'TU_USER_ID_AQUI';  -- ⚠️ CAMBIA ESTO por el ID real del Paso 1

-- ============================================
-- PASO 3: Si el usuario existe, crea la organización
-- Reemplaza 'TU_USER_ID_AQUI' con el ID del Paso 1
-- ============================================
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
  id  -- Esto usa el ID del usuario que existe
FROM users
WHERE id = 'TU_USER_ID_AQUI'  -- ⚠️ CAMBIA ESTO por el ID real del Paso 1
RETURNING id, created_by, name;

-- ============================================
-- PASO 4: Copia el ID de la organización del Paso 3
-- y úsalo aquí para agregar el usuario como miembro
-- Reemplaza 'TU_ORG_ID_AQUI' y 'TU_USER_ID_AQUI'
-- ============================================
INSERT INTO organization_members (
  organization_id,
  user_id,
  role
)
VALUES (
  'TU_ORG_ID_AQUI',      -- ⚠️ CAMBIA ESTO por el ID de la organización del Paso 3
  'TU_USER_ID_AQUI',     -- ⚠️ CAMBIA ESTO por el ID del usuario del Paso 1
  'ADMIN'
)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- ============================================
-- PASO 5: Verificar que todo está correcto
-- ============================================
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.created_by,
  u.id as user_id,
  u.email,
  u.full_name,
  om.role,
  CASE 
    WHEN o.created_by = u.id THEN '✅ Correcto'
    ELSE '❌ Error'
  END as verificacion
FROM organizations o
LEFT JOIN users u ON o.created_by = u.id
LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = u.id
WHERE o.name = 'Restaurante de Prueba'
ORDER BY o.created_at DESC;

