-- =============================================================================
-- Carrousel : cible CATEGORY / PRODUCT / CUSTOM + ids optionnels
-- À exécuter sur PostgreSQL Neon (même base que catalog / admin).
-- Requis : tables category et product existent déjà.
-- =============================================================================

ALTER TABLE carousel_section
    ADD COLUMN IF NOT EXISTS link_target_type VARCHAR(32) NOT NULL DEFAULT 'CUSTOM';

ALTER TABLE carousel_section
    ADD COLUMN IF NOT EXISTS target_category_id INTEGER;

ALTER TABLE carousel_section
    ADD COLUMN IF NOT EXISTS target_product_id INTEGER;

-- Contraintes référentielles (noms explicites pour éviter les doublons si rejeu partiel)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_carousel_section_target_category'
    ) THEN
        ALTER TABLE carousel_section
            ADD CONSTRAINT fk_carousel_section_target_category
            FOREIGN KEY (target_category_id) REFERENCES category (id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_carousel_section_target_product'
    ) THEN
        ALTER TABLE carousel_section
            ADD CONSTRAINT fk_carousel_section_target_product
            FOREIGN KEY (target_product_id) REFERENCES product (id)
            ON DELETE SET NULL;
    END IF;
END $$;

COMMENT ON COLUMN carousel_section.link_target_type IS
    'CUSTOM = lien libre (link_url) ; CATEGORY = target_category_id ; PRODUCT = target_product_id';
COMMENT ON COLUMN carousel_section.target_category_id IS
    'Id catégorie si link_target_type = CATEGORY';
COMMENT ON COLUMN carousel_section.target_product_id IS
    'Id produit si link_target_type = PRODUCT';
