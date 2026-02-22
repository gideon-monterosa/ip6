ALTER TABLE users
    ADD COLUMN work_start_time TIME DEFAULT '09:00:00',
    ADD COLUMN work_end_time TIME DEFAULT '17:00:00';

CREATE TABLE user_working_days (
                                   user_id BIGINT NOT NULL,
                                   day_of_week VARCHAR(20) NOT NULL,
                                   CONSTRAINT fk_user_working_days FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO user_working_days (user_id, day_of_week)
SELECT id, d.day_of_week
FROM users
         CROSS JOIN (
    VALUES ('MONDAY'), ('TUESDAY'), ('WEDNESDAY'), ('THURSDAY'), ('FRIDAY')
) AS d(day_of_week);