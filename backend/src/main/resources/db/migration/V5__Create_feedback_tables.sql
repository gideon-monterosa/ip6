ALTER TABLE events ADD COLUMN feedback_status VARCHAR(20) DEFAULT 'PENDING' NOT NULL;

CREATE TABLE feedbacks (
                           id BIGSERIAL PRIMARY KEY,
                           event_id BIGINT NOT NULL UNIQUE,
                           feedback_type VARCHAR(50) NOT NULL,
                           details JSONB NOT NULL,
                           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                           CONSTRAINT fk_feedback_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX idx_feedbacks_details ON feedbacks USING GIN (details);