-- =============================================================================
-- Althea Systems – Jeu de données de test pour le backoffice admin
-- DB cible : PostgreSQL (Neon)
-- -----------------------------------------------------------------------------
-- Couvre toutes les fonctionnalités du dashboard /admin :
--   - Catégories, produits, utilisateurs, adresses
--   - Commandes (statuts variés) + items + paiements
--   - Messages de contact (NEW / RESPONDED)
--   - Carrousel, texte d'accueil, footer, top produits
--   - Données réparties sur les 35 derniers jours pour tester
--     les vues "7 jours" et "5 semaines" du dashboard
--
-- Le script est idempotent : on peut le ré-exécuter sans erreur grâce à
-- ON CONFLICT (id) DO NOTHING. Pour repartir from scratch, dé-commente le
-- bloc TRUNCATE en début de script.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- (Optionnel) Reset complet de toutes les tables admin avant le seed
-- -----------------------------------------------------------------------------
-- TRUNCATE TABLE
--   order_item, payment, "Order", address,
--   top_product, carousel_section, homepage_text, footer,
--   contact_message, product, category, "User"
-- RESTART IDENTITY CASCADE;


-- =============================================================================
-- 1. CATÉGORIES
-- =============================================================================
INSERT INTO category (id, name, description, image_url, display_order, active, created_at, updated_at) VALUES
  (1, 'Imagerie',     'Scanners, IRM, échographes',                      '/images/cat-imagerie.jpg',     1, true, LOCALTIMESTAMP, LOCALTIMESTAMP),
  (2, 'Chirurgie',    'Outils et instruments chirurgicaux',              '/images/cat-chirurgie.jpg',    2, true, LOCALTIMESTAMP, LOCALTIMESTAMP),
  (3, 'Monitoring',   'Surveillance des patients',                       '/images/cat-monitoring.jpg',   3, true, LOCALTIMESTAMP, LOCALTIMESTAMP),
  (4, 'Mobilier',     'Mobilier médical',                                '/images/cat-mobilier.jpg',     4, true, LOCALTIMESTAMP, LOCALTIMESTAMP),
  (5, 'Consommables', 'Consommables stériles à usage unique',            '/images/cat-consommables.jpg', 5, true, LOCALTIMESTAMP, LOCALTIMESTAMP)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 2. PRODUITS
-- =============================================================================
INSERT INTO product (id, name, description, price, stock, display_priority, active, created_at, updated_at, category_id) VALUES
  (101, 'Scanner médical AX-200',     'Scanner haute définition 64 barrettes pour cabinets médicaux.',     12500.00,   4, 100, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 1),
  (102, 'Échographe portable EP-5',   'Échographe nomade avec sonde linéaire et convexe incluses.',         6800.00,   8,  90, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 1),
  (103, 'IRM compact MRI-3T',         'Système IRM 3 Tesla compact pour imagerie de précision.',           28900.00,   2,  80, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 1),
  (201, 'Laser chirurgical L-X3',     'Laser de précision multi-modes, conforme CE.',                       8900.00,   6,  85, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 2),
  (202, 'Bistouri électrique BE-9',   'Bistouri haute fréquence avec mode coupe et coagulation.',           1450.00,  20,  70, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 2),
  (203, 'Stéthoscope cardiologique',  'Stéthoscope double pavillon adulte / pédiatrique.',                   240.00,  40,  45, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 2),
  (301, 'Moniteur patient MP-7',      'Surveillance multiparamètres : ECG, SpO2, NIBP, TEMP.',              1450.00,  22,  80, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 3),
  (302, 'Capteur SpO2 sans-fil',      'Capteur de saturation en oxygène nomade et rechargeable.',            320.00,  60,  60, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 3),
  (303, 'Pousse-seringue automatique','Pousse-seringue électronique avec écran tactile et alarmes.',        1850.00,  12,  65, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 3),
  (401, 'Table d''examen électrique', 'Table à 3 sections, hauteur réglable électriquement.',               2300.00,   7,  55, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 4),
  (402, 'Chariot médical 4 plateaux', 'Chariot de soins en inox, 4 plateaux, freins centralisés.',           890.00,  15,  50, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 4),
  (403, 'Lampe d''examen LED',        'Lampe d''examen LED bras articulé, intensité réglable.',              430.00,   0,  35, false, LOCALTIMESTAMP, LOCALTIMESTAMP, 4),
  (501, 'Pack consommables stériles', 'Lot de 50 sachets stériles à usage unique.',                          180.00, 145,  40, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 5),
  (502, 'Boîte gants nitrile (x100)', 'Gants nitrile non poudrés, taille M, sans latex.',                     25.00, 320,  30, true, LOCALTIMESTAMP, LOCALTIMESTAMP, 5)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 3. UTILISATEURS
-- password_hash = bcrypt("password")  -- pour info, l'admin n'exige pas de login
-- =============================================================================
INSERT INTO "User" (id, full_name, email, password_hash, created_at, is_email_confirmed, role, status, locked) VALUES
  (1, 'Alice Admin',         'admin@althea.fr',          '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', LOCALTIMESTAMP - INTERVAL '180 days', true,  'ADMIN',    'ACTIVE',    false),
  (2, 'Sam Support',         'support@althea.fr',        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', LOCALTIMESTAMP - INTERVAL '120 days', true,  'SUPPORT',  'ACTIVE',    false),
  (3, 'Jean Dupont',         'jean.dupont@example.com',  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', LOCALTIMESTAMP - INTERVAL  '60 days', true,  'CUSTOMER', 'ACTIVE',    false),
  (4, 'Sara Martin',         'sara.martin@example.com',  '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', LOCALTIMESTAMP - INTERVAL  '45 days', true,  'CUSTOMER', 'ACTIVE',    false),
  (5, 'Lucas Bernard',       'lucas.bernard@example.com','$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', LOCALTIMESTAMP - INTERVAL  '30 days', true,  'CUSTOMER', 'ACTIVE',    false),
  (6, 'Inès Roy',            'ines.roy@example.com',     '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', LOCALTIMESTAMP - INTERVAL  '15 days', false, 'CUSTOMER', 'ACTIVE',    false),
  (7, 'Compte verrouillé',   'verrouille@example.com',   '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', LOCALTIMESTAMP - INTERVAL  '10 days', true,  'CUSTOMER', 'SUSPENDED', true)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 4. ADRESSES
-- =============================================================================
INSERT INTO address (id, user_id, session_id, first_name, last_name, street, city, zip_code, country, phone) VALUES
  (1, 3, NULL, 'Jean',  'Dupont',  '12 rue de Rivoli',             'Paris',     '75001', 'France', '+33 6 12 34 56 78'),
  (2, 4, NULL, 'Sara',  'Martin',  '5 avenue Foch',                'Lyon',      '69006', 'France', '+33 6 22 31 42 50'),
  (3, 5, NULL, 'Lucas', 'Bernard', '8 boulevard de la République', 'Marseille', '13001', 'France', '+33 6 98 76 54 32'),
  (4, 6, NULL, 'Inès',  'Roy',     '21 rue Sainte-Catherine',      'Bordeaux',  '33000', 'France', '+33 6 11 22 33 44')
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 5. COMMANDES — réparties sur les 33 derniers jours
--   Statuts : PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
-- =============================================================================
INSERT INTO "Order" (id, user_id, guest_email, session_id, address_id, total_amount, status, created_at) VALUES
  (1001, 3, NULL, NULL, 1, 12860.00, 'PENDING',    LOCALTIMESTAMP - INTERVAL '4 hours'),
  (1002, 4, NULL, NULL, 2,  1690.00, 'PENDING',    LOCALTIMESTAMP - INTERVAL '6 hours'),
  (1003, 5, NULL, NULL, 3,  6800.00, 'PROCESSING', LOCALTIMESTAMP - INTERVAL '1 days'),
  (1004, 4, NULL, NULL, 2,  3080.00, 'SHIPPED',    LOCALTIMESTAMP - INTERVAL '2 days'),
  (1005, 6, NULL, NULL, 4,   365.00, 'SHIPPED',    LOCALTIMESTAMP - INTERVAL '3 days'),
  (1006, 3, NULL, NULL, 1,  3190.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '4 days'),
  (1007, 5, NULL, NULL, 3,   860.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '5 days'),
  (1008, 4, NULL, NULL, 2,  8900.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '5 days' + INTERVAL '3 hours'),
  (1009, 6, NULL, NULL, 4,  3300.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '6 days'),
  (1010, 3, NULL, NULL, 1, 12500.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '8 days'),
  (1011, 4, NULL, NULL, 2,   580.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '10 days'),
  (1012, 5, NULL, NULL, 3,  6800.00, 'CANCELLED',  LOCALTIMESTAMP - INTERVAL '12 days'),
  (1013, 6, NULL, NULL, 4,  1770.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '14 days'),
  (1014, 3, NULL, NULL, 1, 12680.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '17 days'),
  (1015, 4, NULL, NULL, 2,  4080.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '19 days'),
  (1016, 5, NULL, NULL, 3,  8900.00, 'REFUNDED',   LOCALTIMESTAMP - INTERVAL '21 days'),
  (1017, 6, NULL, NULL, 4,  8250.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '24 days'),
  (1018, 3, NULL, NULL, 1,  2750.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '26 days'),
  (1019, 4, NULL, NULL, 2, 19300.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '28 days'),
  (1020, 5, NULL, NULL, 3,  4670.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '31 days'),
  (1021, 6, NULL, NULL, 4,  4150.00, 'DELIVERED',  LOCALTIMESTAMP - INTERVAL '33 days')
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 6. ITEMS DE COMMANDE (38 lignes)
-- =============================================================================
INSERT INTO order_item (id, order_id, product_id, name, price, quantity) VALUES
  ( 1, 1001, 101, 'Scanner médical AX-200',      12500.00, 1),
  ( 2, 1001, 501, 'Pack consommables stériles',    180.00, 2),
  ( 3, 1002, 301, 'Moniteur patient MP-7',        1450.00, 1),
  ( 4, 1002, 203, 'Stéthoscope cardiologique',     240.00, 1),
  ( 5, 1003, 102, 'Échographe portable EP-5',     6800.00, 1),
  ( 6, 1004, 202, 'Bistouri électrique BE-9',     1450.00, 2),
  ( 7, 1004, 501, 'Pack consommables stériles',    180.00, 1),
  ( 8, 1005, 502, 'Boîte gants nitrile (x100)',     25.00, 5),
  ( 9, 1005, 203, 'Stéthoscope cardiologique',     240.00, 1),
  (10, 1006, 401, 'Table d''examen électrique',   2300.00, 1),
  (11, 1006, 402, 'Chariot médical 4 plateaux',    890.00, 1),
  (12, 1007, 302, 'Capteur SpO2 sans-fil',         320.00, 1),
  (13, 1007, 501, 'Pack consommables stériles',    180.00, 3),
  (14, 1008, 201, 'Laser chirurgical L-X3',       8900.00, 1),
  (15, 1009, 303, 'Pousse-seringue automatique',  1850.00, 1),
  (16, 1009, 301, 'Moniteur patient MP-7',        1450.00, 1),
  (17, 1010, 101, 'Scanner médical AX-200',      12500.00, 1),
  (18, 1011, 203, 'Stéthoscope cardiologique',     240.00, 2),
  (19, 1011, 502, 'Boîte gants nitrile (x100)',     25.00, 4),
  (20, 1012, 102, 'Échographe portable EP-5',     6800.00, 1),
  (21, 1013, 202, 'Bistouri électrique BE-9',     1450.00, 1),
  (22, 1013, 302, 'Capteur SpO2 sans-fil',         320.00, 1),
  (23, 1014, 101, 'Scanner médical AX-200',      12500.00, 1),
  (24, 1014, 501, 'Pack consommables stériles',    180.00, 1),
  (25, 1015, 401, 'Table d''examen électrique',   2300.00, 1),
  (26, 1015, 402, 'Chariot médical 4 plateaux',    890.00, 2),
  (27, 1016, 201, 'Laser chirurgical L-X3',       8900.00, 1),
  (28, 1017, 102, 'Échographe portable EP-5',     6800.00, 1),
  (29, 1017, 301, 'Moniteur patient MP-7',        1450.00, 1),
  (30, 1018, 303, 'Pousse-seringue automatique',  1850.00, 1),
  (31, 1018, 501, 'Pack consommables stériles',    180.00, 5),
  (32, 1019, 101, 'Scanner médical AX-200',      12500.00, 1),
  (33, 1019, 102, 'Échographe portable EP-5',     6800.00, 1),
  (34, 1020, 301, 'Moniteur patient MP-7',        1450.00, 1),
  (35, 1020, 302, 'Capteur SpO2 sans-fil',         320.00, 1),
  (36, 1020, 202, 'Bistouri électrique BE-9',     1450.00, 2),
  (37, 1021, 401, 'Table d''examen électrique',   2300.00, 1),
  (38, 1021, 303, 'Pousse-seringue automatique',  1850.00, 1)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 7. PAIEMENTS (1 par commande)
-- =============================================================================
INSERT INTO payment (id, order_id, provider_payment_id, amount, currency, status, created_at, updated_at, refunded_at) VALUES
  (5001, 1001, 'stripe_test_001', 12860.00, 'EUR', 'PENDING',  LOCALTIMESTAMP - INTERVAL '4 hours',  LOCALTIMESTAMP - INTERVAL '4 hours',  NULL),
  (5002, 1002, 'stripe_test_002',  1690.00, 'EUR', 'PENDING',  LOCALTIMESTAMP - INTERVAL '6 hours',  LOCALTIMESTAMP - INTERVAL '6 hours',  NULL),
  (5003, 1003, 'stripe_test_003',  6800.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '1 days',   LOCALTIMESTAMP - INTERVAL '1 days',   NULL),
  (5004, 1004, 'stripe_test_004',  3080.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '2 days',   LOCALTIMESTAMP - INTERVAL '2 days',   NULL),
  (5005, 1005, 'stripe_test_005',   365.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '3 days',   LOCALTIMESTAMP - INTERVAL '3 days',   NULL),
  (5006, 1006, 'stripe_test_006',  3190.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '4 days',   LOCALTIMESTAMP - INTERVAL '4 days',   NULL),
  (5007, 1007, 'stripe_test_007',   860.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '5 days',   LOCALTIMESTAMP - INTERVAL '5 days',   NULL),
  (5008, 1008, 'stripe_test_008',  8900.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '5 days',   LOCALTIMESTAMP - INTERVAL '5 days',   NULL),
  (5009, 1009, 'stripe_test_009',  3300.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '6 days',   LOCALTIMESTAMP - INTERVAL '6 days',   NULL),
  (5010, 1010, 'stripe_test_010', 12500.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '8 days',   LOCALTIMESTAMP - INTERVAL '8 days',   NULL),
  (5011, 1011, 'stripe_test_011',   580.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '10 days',  LOCALTIMESTAMP - INTERVAL '10 days',  NULL),
  (5012, 1012, 'stripe_test_012',  6800.00, 'EUR', 'FAILED',   LOCALTIMESTAMP - INTERVAL '12 days',  LOCALTIMESTAMP - INTERVAL '12 days',  NULL),
  (5013, 1013, 'stripe_test_013',  1770.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '14 days',  LOCALTIMESTAMP - INTERVAL '14 days',  NULL),
  (5014, 1014, 'stripe_test_014', 12680.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '17 days',  LOCALTIMESTAMP - INTERVAL '17 days',  NULL),
  (5015, 1015, 'stripe_test_015',  4080.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '19 days',  LOCALTIMESTAMP - INTERVAL '19 days',  NULL),
  (5016, 1016, 'stripe_test_016',  8900.00, 'EUR', 'REFUNDED', LOCALTIMESTAMP - INTERVAL '21 days',  LOCALTIMESTAMP - INTERVAL '20 days',  LOCALTIMESTAMP - INTERVAL '20 days'),
  (5017, 1017, 'stripe_test_017',  8250.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '24 days',  LOCALTIMESTAMP - INTERVAL '24 days',  NULL),
  (5018, 1018, 'stripe_test_018',  2750.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '26 days',  LOCALTIMESTAMP - INTERVAL '26 days',  NULL),
  (5019, 1019, 'stripe_test_019', 19300.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '28 days',  LOCALTIMESTAMP - INTERVAL '28 days',  NULL),
  (5020, 1020, 'stripe_test_020',  4670.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '31 days',  LOCALTIMESTAMP - INTERVAL '31 days',  NULL),
  (5021, 1021, 'stripe_test_021',  4150.00, 'EUR', 'CAPTURED', LOCALTIMESTAMP - INTERVAL '33 days',  LOCALTIMESTAMP - INTERVAL '33 days',  NULL)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 8. MESSAGES DE CONTACT (NEW + RESPONDED)
-- =============================================================================
INSERT INTO contact_message (id, full_name, email, subject, message, status, created_at, response_message, responded_by, responded_at) VALUES
  (1, 'Marie Lefebvre',    'marie@hopital.fr',         'Demande de devis – moniteur patient',
      'Bonjour, pourriez-vous me transmettre un devis pour 5 moniteurs patient MP-7 ? Cordialement.',
      'NEW',       LOCALTIMESTAMP - INTERVAL '2 days',  NULL, NULL, NULL),
  (2, 'Cabinet Curie',     'contact@cabinet-curie.fr', 'Délai de livraison',
      'Quel est votre délai pour une commande de 2 lasers chirurgicaux L-X3 ?',
      'RESPONDED', LOCALTIMESTAMP - INTERVAL '5 days',  'Bonjour, le délai est de 3 semaines à compter de la commande.', 'admin', LOCALTIMESTAMP - INTERVAL '4 days'),
  (3, 'Pierre Martin',     'p.martin@example.com',     'Problème de facturation',
      'Je n''ai pas reçu ma facture de la commande 1003. Merci de la renvoyer.',
      'NEW',       LOCALTIMESTAMP - INTERVAL '1 days',  NULL, NULL, NULL),
  (4, 'Hôpital Saint-Luc', 'achats@saint-luc.fr',      'Partenariat',
      'Nous souhaitons mettre en place un partenariat à long terme. Qui contacter ?',
      'RESPONDED', LOCALTIMESTAMP - INTERVAL '10 days', 'Merci de votre intérêt. Notre direction commerciale vous recontacte sous 48h.', 'admin', LOCALTIMESTAMP - INTERVAL '9 days')
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 9. CARROUSEL (3 sections — display_order doit être unique)
-- =============================================================================
INSERT INTO carousel_section (id, title, text, image_url, link_url, display_order, active, created_at, updated_at) VALUES
  (1, 'Innovation médicale', 'Découvrez nos nouveautés 2026 en imagerie haute définition.', '/images/banner-imagerie.jpg',   '/products?cat=imagerie',   1, true, LOCALTIMESTAMP, LOCALTIMESTAMP),
  (2, 'Promo monitoring',    'Jusqu''à -20% sur la gamme moniteurs patient.',               '/images/banner-monitoring.jpg', '/categories/3',            2, true, LOCALTIMESTAMP, LOCALTIMESTAMP),
  (3, 'Consommables',        'Stock permanent de consommables stériles à usage unique.',    '/images/banner-conso.jpg',      '/categories/5',            3, true, LOCALTIMESTAMP, LOCALTIMESTAMP)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 10. TEXTE D'ACCUEIL (singleton — 1 seule ligne attendue par le service)
-- =============================================================================
INSERT INTO homepage_text (id, content, active, created_at, updated_at) VALUES
  (1,
   E'<h1>Althea Systems</h1>\n<p>Équipement médical de confiance pour professionnels de santé.</p>\n<p>Une sélection rigoureuse, un support technique réactif, une conformité totale.</p>',
   true, LOCALTIMESTAMP, LOCALTIMESTAMP)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 11. FOOTER (singleton — 1 seule ligne attendue par le service)
-- =============================================================================
INSERT INTO footer (id, content, active, created_at, updated_at) VALUES
  (1,
   E'Althea Systems SAS – 12 rue des Lilas, 75011 Paris\nTél : +33 1 23 45 67 89 – contact@althea-systems.fr\n© Althea Systems – Tous droits réservés.',
   true, LOCALTIMESTAMP, LOCALTIMESTAMP)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 12. TOP PRODUITS (mise en avant)
-- =============================================================================
INSERT INTO top_product (id, product_id, display_order, active, created_at, updated_at) VALUES
  (1, 101, 1, true, LOCALTIMESTAMP, LOCALTIMESTAMP),  -- Scanner médical AX-200
  (2, 301, 2, true, LOCALTIMESTAMP, LOCALTIMESTAMP),  -- Moniteur patient MP-7
  (3, 102, 3, true, LOCALTIMESTAMP, LOCALTIMESTAMP),  -- Échographe portable EP-5
  (4, 401, 4, true, LOCALTIMESTAMP, LOCALTIMESTAMP)   -- Table d'examen électrique
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 13. RESET DES SÉQUENCES (post-insert)
-- Pour que les futurs INSERT auto-générés (depuis l'UI admin) ne collisionnent
-- pas avec les IDs explicites ci-dessus.
-- =============================================================================
SELECT setval(pg_get_serial_sequence('category',         'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM category),         1));
SELECT setval(pg_get_serial_sequence('product',          'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM product),          1));
SELECT setval(pg_get_serial_sequence('"User"',           'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM "User"),           1));
SELECT setval(pg_get_serial_sequence('address',          'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM address),          1));
SELECT setval(pg_get_serial_sequence('"Order"',          'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM "Order"),          1));
SELECT setval(pg_get_serial_sequence('order_item',       'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM order_item),       1));
SELECT setval(pg_get_serial_sequence('payment',          'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM payment),          1));
SELECT setval(pg_get_serial_sequence('contact_message',  'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM contact_message),  1));
SELECT setval(pg_get_serial_sequence('carousel_section', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM carousel_section), 1));
SELECT setval(pg_get_serial_sequence('homepage_text',    'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM homepage_text),    1));
SELECT setval(pg_get_serial_sequence('footer',           'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM footer),           1));
SELECT setval(pg_get_serial_sequence('top_product',      'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM top_product),      1));

COMMIT;


-- =============================================================================
-- VÉRIFICATION RAPIDE — décommente pour exécuter après le COMMIT
-- =============================================================================
-- SELECT 'category'         AS table_name, COUNT(*) FROM category
-- UNION ALL SELECT 'product',          COUNT(*) FROM product
-- UNION ALL SELECT 'User',             COUNT(*) FROM "User"
-- UNION ALL SELECT 'address',          COUNT(*) FROM address
-- UNION ALL SELECT 'Order',            COUNT(*) FROM "Order"
-- UNION ALL SELECT 'order_item',       COUNT(*) FROM order_item
-- UNION ALL SELECT 'payment',          COUNT(*) FROM payment
-- UNION ALL SELECT 'contact_message',  COUNT(*) FROM contact_message
-- UNION ALL SELECT 'carousel_section', COUNT(*) FROM carousel_section
-- UNION ALL SELECT 'homepage_text',    COUNT(*) FROM homepage_text
-- UNION ALL SELECT 'footer',           COUNT(*) FROM footer
-- UNION ALL SELECT 'top_product',      COUNT(*) FROM top_product;
