-- Seed data for Classroom Tracker (optional)

USE classroom_tracker;

-- Example admin user (password_hash should be generated securely in real apps)
INSERT IGNORE INTO users (email, password_hash, role)
VALUES ('admin@example.com', '$2b$10$examplehashplaceholder', 'admin');

-- Example semester and batch
INSERT IGNORE INTO semesters (semester_no) VALUES ('2026-1');
INSERT IGNORE INTO batches (batch_name, semester_id)
SELECT 'Batch A', semester_id FROM semesters WHERE semester_no = '2026-1' LIMIT 1;
