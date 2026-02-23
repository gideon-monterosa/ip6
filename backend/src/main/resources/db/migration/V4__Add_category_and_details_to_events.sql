ALTER TABLE events
    ADD COLUMN meeting_type VARCHAR(50) DEFAULT 'Other',
    ADD COLUMN location VARCHAR(255),
    ADD COLUMN organizer VARCHAR(255),
    ADD COLUMN attendees_count INTEGER DEFAULT 0;