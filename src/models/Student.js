const { pool } = require('../database/db');

class Student {
    static async findById(studentId) {
        const [rows] = await pool.execute(
            `SELECT s.student_id, s.student_name, s.roll_no, b.batch_name, b.semester_id
             FROM students s
             JOIN batches b ON s.batch_id = b.batch_id
             WHERE s.student_id = ?`,
            [studentId]
        );
        return rows[0];
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute(
            `SELECT student_id, student_name, roll_no, batch_id 
             FROM students 
             WHERE user_id = ?`,
            [userId]
        );
        return rows[0];
    }

    static async getSemester(studentId) {
        const [rows] = await pool.execute(
            `SELECT b.semester_id, s.semester_no 
             FROM students st
             JOIN batches b ON st.batch_id = b.batch_id
             JOIN semesters s ON b.semester_id = s.semester_id
             WHERE st.student_id = ?`,
            [studentId]
        );
        return rows[0];
    }
}

module.exports = Student;