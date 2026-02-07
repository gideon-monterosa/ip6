CREATE TABLE user_oauth_tokens (
                                   id BIGSERIAL PRIMARY KEY,
                                   user_id BIGINT NOT NULL,
                                   provider VARCHAR(20) NOT NULL,
                                   access_token TEXT,
                                   refresh_token TEXT,
                                   expiration_time_millis BIGINT,
                                   created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                   CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                   CONSTRAINT uq_user_provider UNIQUE (user_id, provider)
);