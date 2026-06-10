-- Seed data for Classroom Tracker (optional)

USE classroom_tracker;

INSERT IGNORE INTO users (email, password_hash, role)
VALUES 
('admin@example.com', '$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG', 'admin'),
('prof.wilson@university.com', '$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG', 'teacher'),
('john@university.com', '$2b$10$cK1.nejc4V0tyTWt4NNSo.7X.pD33yRlytAqGThA0l2CCUx4iYqdG', 'student')
 ;

-- INSERT IGNORE INTO semesters (semester_no) VALUES ('2026-1');
-- -- Example semester and batch
-- INSERT IGNORE INTO batches (batch_name, semester_id)
-- SELECT 'Batch A', semester_id FROM semesters WHERE semester_no = '2026-1' LIMIT 1;

-- -- Insert Classrooms (only room_number field exists in schema)
-- INSERT IGNORE INTO classrooms (room_number) VALUES
-- ('R401'),
-- ('R402'),
-- ('B203'),
-- ('C105'),
-- ('A312'),
-- ('N108'),
-- ('G404'),
-- ('D210');
 