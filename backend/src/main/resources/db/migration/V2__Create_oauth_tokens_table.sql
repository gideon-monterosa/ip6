CREATE TABLE user_oauth_tokens (
                                   id BIGSERIAL PRIMARY KEY,
                                   user_id BIGINT NOT NULL UNIQUE,
                                   access_token TEXT,
                                   refresh_token TEXT,
                                   expiration_time_millis BIGINT,
                                   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);