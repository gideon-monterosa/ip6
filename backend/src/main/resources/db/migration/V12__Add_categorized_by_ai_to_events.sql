ALTER TABLE events ADD COLUMN categorized_by_ai BOOLEAN DEFAULT FALSE;
UPDATE events SET categorized_by_ai = TRUE WHERE meeting_type != 'OTHER';
