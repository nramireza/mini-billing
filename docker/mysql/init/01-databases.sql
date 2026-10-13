-- Databases for the mini-billing app.
-- The main database is created by the MySQL image via MYSQL_DATABASE.
-- Here we add the isolated test database used by PHPUnit.

CREATE DATABASE IF NOT EXISTS `mini_billing_test`
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `mini_billing`.* TO 'mini'@'%';
GRANT ALL PRIVILEGES ON `mini_billing_test`.* TO 'mini'@'%';

FLUSH PRIVILEGES;
