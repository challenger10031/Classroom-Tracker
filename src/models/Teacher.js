const { pool } = require('../database/db');

class Teacher {
    static async findById(teacherId) {
        const [rows] = await pool.execute(
            `SELECT t.teacher_id, t.teacher_name, t.department, u.email 
             FROM teachers t 
             JOIN users u ON t.user_id = u.user_id 
             WHERE t.teacher_id = ?`,
            [teacherId]
        );
        return rows[0];
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute(
            `SELECT teacher_id, teacher_name, department 
             FROM teachers 
             WHERE user_id = ?`,
            [userId]
        );
        return rows[0];
    }

    static async findCourses(teacherId) {
        const [rows] = await pool.execute(
            `SELECT course_id, course_code, course_title, semester_id 
             FROM courses 
             WHERE teacher_id = ?`,
            [teacherId]
        );
        return rows;
    }
}

module.exports = Teacher;