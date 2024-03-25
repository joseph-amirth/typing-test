CREATE TABLE `user` (
  id INT UNSIGNED auto_increment PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(256) NOT NULL UNIQUE,
  salt VARBINARY(32) NOT NULL,
  password_hash VARBINARY(32) NOT NULL,
  preferences JSON NOT NULL,
  created_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `result` (
  id INT UNSIGNED auto_increment PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  test_params JSON NOT NULL,
  test_completed_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  wpm FLOAT UNSIGNED NOT NULL,
  raw_wpm FLOAT UNSIGNED NOT NULL,
  accuracy FLOAT UNSIGNED NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  UNIQUE KEY (test_params, test_completed_timestamp, wpm, raw_wpm, accuracy)
);

CREATE TABLE `stat` (
  user_id INT UNSIGNED NOT NULL,
  test_params JSON NOT NULL,
  best_wpm FLOAT UNSIGNED NOT NULL,
  best_raw_wpm FLOAT UNSIGNED NOT NULL,
  best_accuracy FLOAT UNSIGNED NOT NULL,
  sum_wpm FLOAT UNSIGNED NOT NULL,
  sum_raw_wpm FLOAT UNSIGNED NOT NULL,
  sum_accuracy FLOAT UNSIGNED NOT NULL,
  n_results INT UNSIGNED NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE ON UPDATE RESTRICT,
  PRIMARY KEY (user_id, test_params(100))
);

CREATE INDEX `ix_result_user_id` ON `result` (user_id);

source procedures/insert_result.sql;
