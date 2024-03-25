DELIMITER //

CREATE OR REPLACE PROCEDURE insert_result
    (user_id INT UNSIGNED,
    test_params JSON,
    test_completed_timestamp TIMESTAMP,
    wpm FLOAT UNSIGNED,
    raw_wpm FLOAT UNSIGNED,
    accuracy FLOAT UNSIGNED)
MODIFIES SQL DATA
BEGIN
    INSERT INTO result 
        (user_id, test_params, test_completed_timestamp, wpm, raw_wpm, accuracy)
    VALUES (user_id, test_params, test_completed_timestamp, wpm, raw_wpm, accuracy);

    INSERT INTO stat VALUES
        (user_id, test_params, wpm, raw_wpm, accuracy, wpm, raw_wpm, accuracy, 1)
    ON DUPLICATE KEY UPDATE
        -- best_wpm should be set at the end since it is used in the condition.
        best_raw_wpm = IF(wpm > best_wpm, raw_wpm, best_raw_wpm),
        best_accuracy = IF(wpm > best_wpm, accuracy, best_accuracy),
        best_wpm = IF(wpm > best_wpm, wpm, best_wpm),
        sum_wpm = sum_wpm + wpm,
        sum_raw_wpm = sum_raw_wpm + raw_wpm,
        sum_accuracy = sum_accuracy + accuracy,
        n_results = n_results + 1;
END

//
DELIMITER ;
