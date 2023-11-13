-- Because of foreign key constraints.
DROP TABLE IF EXISTS random_test;
DROP TABLE IF EXISTS result;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
  id INT UNSIGNED auto_increment PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(256) UNIQUE CHECK(email REGEXP '^.+\@.+$'),
  salt VARBINARY(32) NOT NULL CHECK(length(salt) = 32),
  password_hash VARBINARY(32) NOT NULL CHECK(length(password_hash) = 32),
  preferences JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE result (
  id INT UNSIGNED auto_increment PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  test_params JSON NOT NULL,
  test_completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  wpm FLOAT UNSIGNED NOT NULL,
  raw_wpm FLOAT UNSIGNED NOT NULL,
  accuracy FLOAT UNSIGNED NOT NULL,
  CONSTRAINT `fk_user_result` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE RESTRICT
);

CREATE TABLE random_test (
  id UUID PRIMARY KEY,
  params JSON NOT NULL
);
