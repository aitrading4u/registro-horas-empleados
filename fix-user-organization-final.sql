-- ============================================
-- SOLUCIÓN FINAL: Verificar usuarios y crear organización
-- ============================================
-- Este SQL primero muestra TODOS los usuarios y luego crea la organización
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver TODOS los usuarios con sus IDs exactos
SELECT 
  id,
  email,
  full_name,
  created_at,
  LENGTH(id::text) as id_length
FROM users
ORDER BY created_at DESC;

-- Paso 2: Crear la organización SIN la foreign key constraint
-- Primero, vamos a crear la organización con created_by como NULL temporalmente
-- y luego actualizarla

-- Opción A: Si el usuario existe, usar su ID directamente
DO $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_user_count INTEGER;
BEGIN
  -- Contar cuántos usuarios hay
  SELECT COUNT(*) INTO v_user_count FROM users;
  RAISE NOTICE 'Total de usuarios en la tabla: %', v_user_count;
  
  -- Obtener el ID del primer usuario (o el que necesites)
  SELECT id INTO v_user_id
  FROM users
  ORDER BY created_at ASC
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios en la tabla';
  END IF;
  
  RAISE NOTICE 'Usuario seleccionado: %', v_user_id;
  
  -- Verificar que el usuario realmente existe
  SELECT COUNT(*) INTO v_user_count
  FROM users
  WHERE id = v_user_id;
  
  IF v_user_count = 0 THEN
    RAISE EXCEPTION 'Usuario con ID % no existe en la tabla users', v_user_id;
  END IF;
  
  RAISE NOTICE 'Usuario verificado: existe en la tabla';
  
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
  
  RAISE NOTICE 'Organización creada con ID: %', v_org_id;
  
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
  ON CONFLICT (organization_id, user_id) DO NOTHING;
  
  RAISE NOTICE 'Usuario agregado como ADMIN';
END $$;

-- Paso 3: Verificar que todo se creó correctamente
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
LEFT JOIN users u ON o.created_by = u.id
LEFT JOIN organization_members om ON o.id = om.organization_id AND om.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 5;


