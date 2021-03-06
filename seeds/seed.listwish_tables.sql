BEGIN;

TRUNCATE
  listwish_lists,
  listwish_wishes,
  listwish_users
RESTART IDENTITY CASCADE;

INSERT INTO listwish_users (preferred_name, user_name, password)
VALUES
  ('Lip', 'lipCowan', '$2a$04$96pkDTqjJt2p7DeNtOEv2uXBwMacKqmcsacnEsAkjXIVXod7fuCUG'),
  ('Mike', 'MikeB', '$2a$04$2zsghQ6mXXOgLgbbqrvmouZZaHUja1rSWtkR1umv7TFUCDFzeCi5q'),
  ('Usain', 'UBolt', '$2a$04$n8dz3waDZ4lHyHzU2gs.9eVxSksc80RI4ZDGMrVrzhIYBnZA91ydC'),
  ('Sammy', 'SamKeil', '$2a$04$4CAvRCgaBwg2w3RmGapwp.BzjUUkgAlHRnxFh90e27XveceB.AKQK'),
  ('Jen', 'RescueDogz2', '$2a$04$v2tAmbgNJwDapMzMFM1e4.FR8/KJ7ZzBNKcsm6g5Tc4J8OOAdQFOC');

INSERT INTO listwish_lists (list_title, list_description, user_id)
VALUES 
  ('Rescue-List', 'List of items for our animal rescue', 5 ),
  ('House Warming', 'My wishlist for my housewarming party', 5),
  ('Makeup Tutorials', 'Items needed for upcoming tutorials', 4),
  ('Running Forever', 'Shoes etc. needed for our local charity track team', 3),
  ('Theatre Essentials', 'Everything I need for my new home theatre set-up', 2),
  ('TEST', 'Test-list for day 1', 1);


INSERT INTO listwish_wishes (wish_title, wish_url, list_id, user_id)
VALUES
  ('Chew Toys', 'https://www.amazon.com/dp/B07Z4GBGVV/ref=cm_sw_em_r_mt_dp_tbutFbYZ3JRGB', 1, 5),
  ('New Balance - size 7', 'https://www.amazon.com/New-Balance-Womens-Arishi-Running/dp/B07BL357Y5/ref=sr_1_3?dchild=1&keywords=new%2Bbalance%2Bsize%2B7&qid=1598898394&sr=8-3&th=1', 4, 3),
  ('Naked3 Palatte', NULL, 3, 4),
  ('Potted Plants', NULL, 2, 5),
  ('Dark Knight Trilogy UHD BluRay', NULL, 5, 2),
  ('Test Item', 'WWW.TEST.COM', 6, 1);

COMMIT;