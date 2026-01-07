-- ============================================
-- SOLUCIÓN: Crear organización para usuario existente (VERSIÓN SEGURA)
-- ============================================
-- Este SQL primero verifica qué usuarios existen y luego crea la organización
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 0: Ver qué usuarios existen
SELECT id, email, full_name, created_at
FROM users
ORDER BY created_at DESC;

-- Paso 1: Crear la organización usando el email (más seguro)
-- Esto encuentra el usuario por email y crea la organización
DO $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
BEGIN
  -- Encontrar el usuario por email
  SELECT id INTO v_user_id
  FROM users
  WHERE email = 'aitrading4u@icloud.com'  -- Cambia por el email de tu usuario
  LIMIT 1;
  
  -- Verificar que el usuario existe
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario con email aitrading4u@icloud.com no encontrado';
  END IF;
  
  RAISE NOTICE 'Usuario encontrado: %', v_user_id;
  
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
  
  RAISE NOTICE 'Organización creada: %', v_org_id;
  
  -- Agregar el usuario como miembro ADMIN
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role
  ) VALUES (
    v_org_id,
    v_user_id,
    'ADMIN'
  );
  
  RAISE NOTICE 'Usuario agregado como ADMIN a la organización';
END $$;

-- Paso 2: Verificar que todo se creó correctamente
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


