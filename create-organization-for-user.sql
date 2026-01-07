-- ============================================
-- Crear organización para un usuario existente
-- ============================================
-- Reemplaza 'USER_ID_AQUI' con el ID del usuario que viste en la tabla users
-- En tu caso, parece ser: 61882cdb-e863-4bea-8d22-60486100ad15

-- 1. Crear la organización
INSERT INTO organizations (
  name,
  address,
  latitude,
  longitude,
  allowed_radius,
  timezone,
  created_by
) VALUES (
  'Restaurante de Prueba',
  'Calle de Prueba, 1, Madrid, España',
  40.4168,
  -3.7038,
  75,
  'Europe/Madrid',
  '61882cdb-e863-4bea-8d22-60486100ad15'  -- Reemplaza con el ID real del usuario
)
RETURNING id;

-- 2. Agregar el usuario como miembro ADMIN de la organización
-- (Usa el ID de la organización que se retornó arriba)
INSERT INTO organization_members (
  organization_id,
  user_id,
  role
) VALUES (
  'ORGANIZATION_ID_AQUI',  -- Reemplaza con el ID de la organización creada arriba
  '61882cdb-e863-4bea-8d22-60486100ad15',  -- Reemplaza con el ID del usuario
  'ADMIN'
);

-- 3. Verificar que todo se creó correctamente
SELECT 
  o.id as org_id,
  o.name as org_name,
  u.id as user_id,
  u.email,
  om.role
FROM organizations o
JOIN organization_members om ON o.id = om.organization_id
JOIN users u ON om.user_id = u.id
WHERE u.id = '61882cdb-e863-4bea-8d22-60486100ad15';  -- Reemplaza con el ID del usuario


