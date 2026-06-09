-- Schema for Classroom Tracker (generated from init_db.sql)

-- DATABASE CREATION
CREATE DATABASE IF NOT EXISTS classroom_tracker;
USE classroom_tracker;

-- USER TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEMESTER TABLE
CREATE TABLE IF NOT EXISTS semesters (
    semester_id INT AUTO_INCREMENT PRIMARY KEY,
    semester_no VARCHAR(50) NOT NULL UNIQUE
);

-- BATCH TABLE
CREATE TABLE IF NOT EXISTS batches (
    batch_id INT AUTO_INCREMENT PRIMARY KEY,
    batch_name VARCHAR(50) NOT NULL,
    semester_id INT NOT NULL UNIQUE,
    FOREIGN KEY (semester_id)
        REFERENCES semesters(semester_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- STUDENT TABLE
CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    batch_id INT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    roll_no VARCHAR(50) UNIQUE,
    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (batch_id)
        REFERENCES batches(batch_id)
        ON DELETE RESTRICT
);

-- TEACHER TABLE
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    teacher_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- COURSE TABLE
CREATE TABLE IF NOT EXISTS courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_title VARCHAR(150) NOT NULL,
    semester_id INT NOT NULL,
    teacher_id INT NOT NULL,
    FOREIGN KEY (semester_id)
        REFERENCES semesters(semester_id)
        ON DELETE RESTRICT,
    FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON DELETE RESTRICT
);

-- CLASSROOM TABLE
CREATE TABLE IF NOT EXISTS classrooms (
    classroom_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE
);

-- TIMESLOT TABLE
CREATE TABLE IF NOT EXISTS timeslots (
    timeslot_id INT AUTO_INCREMENT PRIMARY KEY,
    slot_no INT NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    classroom_id INT NOT NULL,
    timeslot_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE RESTRICT,
    FOREIGN KEY (classroom_id)
        REFERENCES classrooms(classroom_id)
        ON DELETE RESTRICT,
    FOREIGN KEY (timeslot_id)
        REFERENCES timeslots(timeslot_id)
        ON DELETE RESTRICT
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_schedule_course ON schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedule_timeslot ON schedules(timeslot_id);
CREATE INDEX IF NOT EXISTS idx_schedule_room ON schedules(classroom_id);

-- CONFLICT PREVENTION
ALTER TABLE schedules
ADD CONSTRAINT IF NOT EXISTS unique_room_slot
UNIQUE (classroom_id, schedule_date, timeslot_id);

-- DEFAULT TIMESLOTS (upsert style)
INSERT INTO timeslots (slot_no, start_time, end_time)
VALUES
(1, '08:30:00', '10:00:00'),
(2, '10:00:00', '11:30:00'),
(3, '11:30:00', '01:00:00')
ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time);
