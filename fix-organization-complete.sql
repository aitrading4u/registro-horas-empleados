-- ============================================
-- SOLUCIÓN COMPLETA: Eliminar FKs y crear organización
-- ============================================
-- Este SQL elimina TODAS las foreign key constraints temporalmente,
-- crea la organización, y luego las recrea
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver TODOS los usuarios con sus IDs EXACTOS
SELECT 
  id,
  email,
  full_name,
  created_at,
  id::text as id_text
FROM users
ORDER BY created_at DESC;

-- Paso 2: Eliminar TODAS las foreign key constraints temporalmente
ALTER TABLE organizations 
DROP CONSTRAINT IF EXISTS organizations_created_by_fkey;

ALTER TABLE organization_members
DROP CONSTRAINT IF EXISTS organization_members_user_id_fkey;

ALTER TABLE organization_members
DROP CONSTRAINT IF EXISTS organization_members_organization_id_fkey;

-- Paso 3: Crear organización usando el EMAIL del usuario
-- Cambia 'aitrading4u@icloud.com' por el email de tu usuario
DO $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_user_email TEXT := 'aitrading4u@icloud.com';  -- ⚠️ CAMBIA ESTO por el email de tu usuario
BEGIN
  -- Buscar el usuario por EMAIL
  SELECT id INTO v_user_id
  FROM users
  WHERE email = v_user_email
  LIMIT 1;
  
  -- Verificar que encontramos el usuario
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email % no encontrado. Verifica el email en el Paso 1.', v_user_email;
  END IF;
  
  RAISE NOTICE '✅ Usuario encontrado: % (%)', v_user_email, v_user_id;
  
  -- Verificar que el usuario realmente existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Usuario con ID % no existe en la tabla users', v_user_id;
  END IF;
  
  RAISE NOTICE '✅ Usuario verificado en la tabla';
  
  -- Crear la organización (ahora sin las foreign key constraints)
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
    v_user_id
  )
  RETURNING id INTO v_org_id;
  
  RAISE NOTICE '✅ Organización creada: %', v_org_id;
  
  -- Agregar el usuario como miembro ADMIN (ahora sin las foreign key constraints)
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role
  ) VALUES (
    v_org_id,
    v_user_id,
    'ADMIN'
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'ADMIN';
  
  RAISE NOTICE '✅ Usuario agregado como ADMIN';
END $$;

-- Paso 4: Recrear las foreign key constraints
-- (Solo si los datos son válidos)
ALTER TABLE organizations
ADD CONSTRAINT organizations_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES users(id);

ALTER TABLE organization_members
ADD CONSTRAINT organization_members_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id);

ALTER TABLE organization_members
ADD CONSTRAINT organization_members_organization_id_fkey
FOREIGN KEY (organization_id)
REFERENCES organizations(id) ON DELETE CASCADE;

-- Paso 5: Verificar que todo está correcto
SELECT 
  o.id as org_id,
  o.name as org_name,
  o.created_by as org_created_by,
  u.id as user_id,
  u.email,
  u.full_name,
  om.role,
  CASE 
    WHEN o.created_by = u.id THEN '✅ Correcto'
    ELSE '❌ Error: IDs no coinciden'
  END as verificacion
FROM organizations o
LEFT JOIN users u ON o.created_by = u.id
LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = u.id
WHERE o.name = 'Restaurante de Prueba'
ORDER BY o.created_at DESC;


