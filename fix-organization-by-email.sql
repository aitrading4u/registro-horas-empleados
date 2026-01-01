-- ============================================
-- SOLUCIÓN: Crear organización usando EMAIL
-- ============================================
-- Este SQL usa el EMAIL para encontrar al usuario (más seguro)
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver TODOS los usuarios
SELECT id, email, full_name, created_at
FROM users
ORDER BY created_at DESC;

-- Paso 2: Crear organización usando el EMAIL del usuario
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
  
  -- Verificar que el usuario realmente existe (doble verificación)
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Usuario con ID % no existe en la tabla users', v_user_id;
  END IF;
  
  RAISE NOTICE '✅ Usuario verificado en la tabla';
  
  -- Crear la organización
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
  
  -- Agregar el usuario como miembro ADMIN
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

-- Paso 3: Verificar que todo está correcto
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
JOIN users u ON o.created_by = u.id
JOIN organization_members om ON o.id = om.organization_id AND om.user_id = u.id
WHERE o.name = 'Restaurante de Prueba'
ORDER BY o.created_at DESC;

