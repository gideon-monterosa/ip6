CREATE TABLE daily_feedbacks (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    feedback_date   DATE         NOT NULL,
    feedback_status VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    details         JSONB,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_daily_feedback_user  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_daily_feedback_user_date UNIQUE (user_id, feedback_date)
);

CREATE INDEX idx_daily_feedbacks_user_date ON daily_feedbacks (user_id, feedback_date);
