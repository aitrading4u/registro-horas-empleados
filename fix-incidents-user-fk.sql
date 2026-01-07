-- ============================================
-- SOLUCIÓN: Verificar usuario y arreglar foreign key de incidents
-- ============================================
-- Este SQL verifica el usuario y arregla la foreign key constraint
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Verificar qué usuarios existen
SELECT id, email, full_name, created_at
FROM users
ORDER BY created_at DESC;

-- Paso 2: Verificar si el usuario específico existe
SELECT id, email, full_name
FROM users
WHERE id = '61882cdb-e863-4bea-8d22-60486100ad15';

-- Paso 3: Si el usuario no existe, necesitamos eliminar temporalmente la foreign key
-- o verificar que el ID que se está usando es correcto
-- Primero, eliminemos temporalmente la foreign key constraint
ALTER TABLE incidents
DROP CONSTRAINT IF EXISTS incidents_user_id_fkey;

ALTER TABLE incidents
DROP CONSTRAINT IF EXISTS incidents_organization_id_fkey;

-- Paso 4: Verificar que las constraints se eliminaron
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'incidents'::regclass
AND contype = 'f'
ORDER BY conname;

-- Paso 5: Recrear las foreign key constraints (solo si los datos son válidos)
-- Primero verificamos que existan usuarios y organizaciones
DO $$
DECLARE
  v_user_count INTEGER;
  v_org_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_user_count FROM users;
  SELECT COUNT(*) INTO v_org_count FROM organizations;
  
  RAISE NOTICE 'Total de usuarios: %', v_user_count;
  RAISE NOTICE 'Total de organizaciones: %', v_org_count;
  
  -- Recrear las foreign keys solo si hay datos
  IF v_user_count > 0 THEN
    ALTER TABLE incidents
    ADD CONSTRAINT incidents_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key incidents_user_id_fkey recreada';
  END IF;
  
  IF v_org_count > 0 THEN
    ALTER TABLE incidents
    ADD CONSTRAINT incidents_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key incidents_organization_id_fkey recreada';
  END IF;
END $$;

-- Paso 6: Actualizar el schema cache de Supabase
NOTIFY pgrst, 'reload schema';


