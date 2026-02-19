-- =============================================================================
-- ro-store-v2 — Migration inicial
-- Arquivo: 20260218000000_initial_schema.sql
--
-- Ordem de execução:
--   1. fn_update_timestamp
--   2. is_admin()
--   3. profiles + fn_handle_new_user + trigger
--   4. products, product_versions, product_images
--   5. orders, order_items, fn_check_duplicate_license + trigger
--   6. licenses, audit_logs
--   7. Índices
--   8. RLS policies
--   9. Column-level security (file_path_secure)
--  10. Storage buckets
--  11. Supabase Realtime
-- =============================================================================

-- =============================================================================
-- 0. EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. FUNCTION: fn_update_timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 2. FUNCTION: is_admin() — helper SECURITY DEFINER para as RLS policies
--    SECURITY DEFINER evita recursão infinita nas policies de profiles.
--    SET search_path = public previne search_path injection.
-- =============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role TEXT;
BEGIN
  SELECT role INTO _role FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(_role = 'admin', false);
END;
$$;

-- =============================================================================
-- 3. TABLE: profiles
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  cpf_cnpj     TEXT,
  role         TEXT NOT NULL DEFAULT 'customer'
                 CHECK (role IN ('admin', 'customer')),
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON COLUMN profiles.cpf_cnpj IS 'Dado fiscal sensível (LGPD). Apenas números, sem formatação. Nunca logar.';
COMMENT ON COLUMN profiles.role IS 'Roles fixos: admin (somente você) ou customer (compradores).';

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- =============================================================================
-- 4. FUNCTION + TRIGGER: fn_handle_new_user
--    Cria automaticamente um profile quando um usuário se cadastra.
--    SECURITY DEFINER necessário para inserir em profiles a partir de auth.users.
--    ON CONFLICT DO NOTHING: seguro para re-trigger (ex: Discord OAuth).
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_users_after_insert ON auth.users;
CREATE TRIGGER trg_auth_users_after_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- =============================================================================
-- 5. TABLE: products
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  description          TEXT NOT NULL DEFAULT '',
  price                NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category             TEXT NOT NULL
                         CHECK (category IN ('pvp', 'pve', 'quest', 'visual', 'economy', 'system')),
  emulators            TEXT[] NOT NULL DEFAULT '{}',
  install_type         TEXT NOT NULL
                         CHECK (install_type IN ('script_npc', 'source_cpp', 'plugin_dll')),
  client_requirements  TEXT,
  youtube_url          TEXT,
  is_published         BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON COLUMN products.slug IS 'Gerado a partir do title no momento da criação. Imutável após publicação.';
COMMENT ON COLUMN products.emulators IS 'Array de emuladores suportados: rathena, hercules.';

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- =============================================================================
-- 6. TABLE: product_versions
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  version_number   TEXT NOT NULL,
  changelog        TEXT NOT NULL DEFAULT '',
  file_path_secure TEXT NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE (product_id, version_number)
);

COMMENT ON COLUMN product_versions.file_path_secure IS 'RESTRITO: nunca incluir em SELECT retornado ao client. Usar apenas em download-service.ts com service_role.';

-- =============================================================================
-- 7. TABLE: product_images
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =============================================================================
-- 8. TABLE: orders
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status              TEXT NOT NULL DEFAULT 'pending_payment'
                        CHECK (status IN ('pending_payment', 'paid', 'expired', 'cancelled')),
  payment_method      TEXT NOT NULL
                        CHECK (payment_method IN ('pix', 'boleto', 'credit_card')),
  asaas_payment_id    TEXT UNIQUE,
  total_amount        NUMERIC(10, 2) NOT NULL,
  pix_copy_paste      TEXT,
  boleto_url          TEXT,
  boleto_barcode      TEXT,
  payment_expires_at  TIMESTAMPTZ,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON COLUMN orders.total_amount IS 'SNAPSHOT: valor no momento do pedido. Nunca recalcular a partir do preço atual do produto.';
COMMENT ON COLUMN orders.asaas_payment_id IS 'Usado para idempotência: verificar antes de processar o webhook para evitar licenças duplicadas.';

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- =============================================================================
-- 9. TABLE: order_items
-- =============================================================================

CREATE TABLE IF NOT EXISTS order_items (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                  UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id                UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_title_at_purchase TEXT NOT NULL,
  price_at_purchase         NUMERIC(10, 2) NOT NULL,
  created_at                TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE (order_id, product_id)
);

COMMENT ON COLUMN order_items.product_title_at_purchase IS 'SNAPSHOT: título no momento da compra. Anti-chargeback.';
COMMENT ON COLUMN order_items.price_at_purchase IS 'SNAPSHOT: preço cobrado. Nunca usar products.price retroativamente.';

-- =============================================================================
-- 10. FUNCTION + TRIGGER: fn_check_duplicate_license
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_check_duplicate_license()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM licenses
    WHERE product_id = NEW.product_id
      AND user_id = (SELECT user_id FROM orders WHERE id = NEW.order_id)
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Usuário já possui licença ativa para este produto.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_before_insert ON order_items;
CREATE TRIGGER trg_order_items_before_insert
  BEFORE INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION fn_check_duplicate_license();

-- =============================================================================
-- 11. TABLE: licenses
-- =============================================================================

CREATE TABLE IF NOT EXISTS licenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id  UUID NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE RESTRICT,
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  license_key    TEXT NOT NULL UNIQUE,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON COLUMN licenses.license_key IS 'Hash único gerado pelo license-service.ts. Formato: XXXX-XXXX-XXXX-XXXX.';
COMMENT ON COLUMN licenses.is_active IS 'FALSE quando revogada pelo admin.';

CREATE TRIGGER trg_licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- =============================================================================
-- 12. TABLE: audit_logs (write-only — sem UPDATE/DELETE policies)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL DEFAULT '',
  entity_id   UUID,
  ip_address  INET,
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE audit_logs IS 'Imutável: sem UPDATE ou DELETE policies para nenhum role, incluindo admin.';

-- =============================================================================
-- 13. ÍNDICES
-- =============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- products
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_emulators ON products USING GIN(emulators);

-- product_versions
CREATE INDEX IF NOT EXISTS idx_product_versions_product_id ON product_versions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_versions_product_created ON product_versions(product_id, created_at DESC);

-- product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_asaas_payment_id ON orders(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- licenses
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_licenses_is_active ON licenses(is_active);
CREATE INDEX IF NOT EXISTS idx_licenses_order_item_id ON licenses(order_item_id);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================================================
-- 14. RLS POLICIES
-- =============================================================================

-- profiles ---------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own_or_admin ON profiles;
CREATE POLICY profiles_select_own_or_admin ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND NOT is_admin());

DROP POLICY IF EXISTS profiles_update_admin ON profiles;
CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (is_admin());

-- products ---------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_select_published ON products;
CREATE POLICY products_select_published ON products
  FOR SELECT USING (is_published = true OR is_admin());

DROP POLICY IF EXISTS products_insert_admin ON products;
CREATE POLICY products_insert_admin ON products
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS products_update_admin ON products;
CREATE POLICY products_update_admin ON products
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS products_delete_admin ON products;
CREATE POLICY products_delete_admin ON products
  FOR DELETE USING (is_admin());

-- product_versions -------------------------------------------------------
ALTER TABLE product_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_versions_select_authenticated ON product_versions;
CREATE POLICY product_versions_select_authenticated ON product_versions
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM products WHERE id = product_id AND is_published = true
    ))
    OR is_admin()
  );

DROP POLICY IF EXISTS product_versions_insert_admin ON product_versions;
CREATE POLICY product_versions_insert_admin ON product_versions
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS product_versions_update_admin ON product_versions;
CREATE POLICY product_versions_update_admin ON product_versions
  FOR UPDATE USING (is_admin());

-- product_images ---------------------------------------------------------
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_images_select_all ON product_images;
CREATE POLICY product_images_select_all ON product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS product_images_insert_admin ON product_images;
CREATE POLICY product_images_insert_admin ON product_images
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS product_images_update_admin ON product_images;
CREATE POLICY product_images_update_admin ON product_images
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS product_images_delete_admin ON product_images;
CREATE POLICY product_images_delete_admin ON product_images
  FOR DELETE USING (is_admin());

-- orders -----------------------------------------------------------------
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS orders_select_own_or_admin ON orders;
CREATE POLICY orders_select_own_or_admin ON orders
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS orders_insert_authenticated ON orders;
CREATE POLICY orders_insert_authenticated ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- order_items ------------------------------------------------------------
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS order_items_select_own_or_admin ON order_items;
CREATE POLICY order_items_select_own_or_admin ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
    OR is_admin()
  );

-- licenses ---------------------------------------------------------------
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS licenses_select_own_or_admin ON licenses;
CREATE POLICY licenses_select_own_or_admin ON licenses
  FOR SELECT USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS licenses_update_admin ON licenses;
CREATE POLICY licenses_update_admin ON licenses
  FOR UPDATE USING (is_admin());

-- audit_logs -------------------------------------------------------------
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_select_admin ON audit_logs;
CREATE POLICY audit_logs_select_admin ON audit_logs
  FOR SELECT USING (is_admin());

-- =============================================================================
-- 15. COLUMN-LEVEL SECURITY — file_path_secure
--     RLS controla linhas; REVOKE controla coluna.
--     service_role ainda consegue ler (necessário para download-service.ts).
-- =============================================================================

REVOKE SELECT (file_path_secure) ON product_versions FROM authenticated;

-- =============================================================================
-- 16. STORAGE BUCKETS
-- =============================================================================

-- Bucket público: product-media (imagens da galeria)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS product_media_select_all ON storage.objects;
CREATE POLICY product_media_select_all ON storage.objects
  FOR SELECT USING (bucket_id = 'product-media');

DROP POLICY IF EXISTS product_media_insert_admin ON storage.objects;
CREATE POLICY product_media_insert_admin ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-media' AND is_admin());

DROP POLICY IF EXISTS product_media_update_admin ON storage.objects;
CREATE POLICY product_media_update_admin ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-media' AND is_admin());

DROP POLICY IF EXISTS product_media_delete_admin ON storage.objects;
CREATE POLICY product_media_delete_admin ON storage.objects
  FOR DELETE USING (bucket_id = 'product-media' AND is_admin());

-- Bucket privado: product-files (arquivos para download)
-- Sem SELECT policy: acesso apenas via Signed URL com service_role
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-files', 'product-files', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS product_files_insert_admin ON storage.objects;
CREATE POLICY product_files_insert_admin ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-files' AND is_admin());

-- =============================================================================
-- 17. SUPABASE REALTIME
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
