CREATE TABLE user (
  id INT UNSIGNED auto_increment PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  salt VARBINARY(32) NOT NULL,
  password_hash VARBINARY(32) NOT NULL,
  preferences JSON NOT NULL,
  created_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE result (
  id INT UNSIGNED auto_increment PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  test_params JSON NOT NULL,
  test_completed_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  wpm FLOAT UNSIGNED NOT NULL,
  raw_wpm FLOAT UNSIGNED NOT NULL,
  accuracy FLOAT UNSIGNED NOT NULL,
  CONSTRAINT `fk_user_result` FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `unique_result` UNIQUE KEY (test_params, test_completed_timestamp, wpm, raw_wpm, accuracy)
);
