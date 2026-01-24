-- Repeatable migration for test data
-- This runs every time the file changes (useful for development)
-- Delete existing test data to avoid conflicts on re-run

DELETE FROM users WHERE username IN ('testuser', 'admin');

-- Insert test user (password: "password123")
-- BCrypt hash generated for "password123"
INSERT INTO users (username, email, password, role, created_at, updated_at)
VALUES (
    'testuser',
    'testuser@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'USER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert admin user (password: "admin123")
-- BCrypt hash generated for "admin123"
INSERT INTO users (username, email, password, role, created_at, updated_at)
VALUES (
    'admin',
    'admin@example.com',
    '$2a$10$8V3YOCIJhJmxW4YmGKJq7eXPvq5JqZlz0H8.qZqJ9YHJKqDGx5Ezu',
    'ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
