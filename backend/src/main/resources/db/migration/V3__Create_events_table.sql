-- Tabelle erstellen
CREATE TABLE events (
                        id BIGSERIAL PRIMARY KEY,
                        user_id BIGINT NOT NULL,
                        external_id VARCHAR(255) NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        start_time TIMESTAMP NOT NULL,
                        end_time TIMESTAMP NOT NULL,
                        link TEXT,
                        provider VARCHAR(20) NOT NULL,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Fremdschlüssel zum User: Wenn der User gelöscht wird, werden auch seine Events gelöscht
                        CONSTRAINT fk_events_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Verhindert Duplikate: Ein Event mit derselben ID vom selben Provider für denselben User darf nur einmal existieren
                        CONSTRAINT uq_events_external_id UNIQUE (user_id, provider, external_id)
);

-- Index für schnellere Abfragen nach Zeiträumen (wichtig für deinen Kalender-View!)
CREATE INDEX idx_events_user_start_time ON events(user_id, start_time);