-- ============================================
-- SOLUCIÓN AUTOMÁTICA: Crear organización
-- ============================================
-- Este SQL hace TODO automáticamente usando el primer usuario que encuentre
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver qué usuarios existen
SELECT id, email, full_name, created_at
FROM users
ORDER BY created_at DESC;

-- Paso 2: Crear organización y miembro en una sola transacción
DO $$
DECLARE
  v_user_record RECORD;
  v_org_id UUID;
BEGIN
  -- Obtener el primer usuario (el más antiguo)
  SELECT id, email, full_name INTO v_user_record
  FROM users
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- Verificar que encontramos un usuario
  IF v_user_record.id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún usuario en la tabla';
  END IF;
  
  RAISE NOTICE 'Usuario encontrado: % (%)', v_user_record.email, v_user_record.id;
  
  -- Crear la organización usando el ID del usuario encontrado
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
    v_user_record.id  -- Usa el ID del usuario que realmente existe
  )
  RETURNING id INTO v_org_id;
  
  RAISE NOTICE 'Organización creada: %', v_org_id;
  
  -- Agregar el usuario como miembro ADMIN usando el mismo ID
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role
  ) VALUES (
    v_org_id,
    v_user_record.id,  -- Usa el mismo ID del usuario
    'ADMIN'
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'ADMIN';
  
  RAISE NOTICE 'Usuario agregado como ADMIN';
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
    ELSE '❌ Error: IDs no coinciden'
  END as verificacion
FROM organizations o
JOIN users u ON o.created_by = u.id
JOIN organization_members om ON o.id = om.organization_id AND om.user_id = u.id
WHERE o.name = 'Restaurante de Prueba'
ORDER BY o.created_at DESC;

