-- Drop stored procedures
DROP PROCEDURE IF EXISTS award_points;
DROP PROCEDURE IF EXISTS redeem_points;
DROP PROCEDURE IF EXISTS update_membership_level;

-- Drop triggers first
DROP TRIGGER IF EXISTS after_order_complete;

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS point_transactions;
DROP TABLE IF EXISTS points_transactions;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
