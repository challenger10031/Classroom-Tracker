const { pool } = require('../database/db');

class Schedule {
    static async findFutureSchedules(limit = 30) {
        const [rows] = await pool.execute(
            `SELECT s.schedule_id, s.schedule_date, c.course_code, c.course_title,
                    cr.room_number, t.start_time, t.end_time, t.slot_no,
                    te.teacher_name, s.status
             FROM schedules s
             JOIN courses c ON s.course_id = c.course_id
             JOIN classrooms cr ON s.classroom_id = cr.classroom_id
             JOIN timeslots t ON s.timeslot_id = t.timeslot_id
             JOIN teachers te ON c.teacher_id = te.teacher_id
             WHERE s.schedule_date >= CURDATE() AND s.status = 'scheduled'
             ORDER BY s.schedule_date, t.slot_no
             LIMIT ?`,
            [limit]
        );
        return rows;
    }

    static async findStudentSchedules(semesterId, studentId) {
        const [rows] = await pool.execute(
            `SELECT s.schedule_id, s.schedule_date, c.course_code, c.course_title,
                    cr.room_number, t.start_time, t.end_time, t.slot_no,
                    te.teacher_name
             FROM schedules s
             JOIN courses c ON s.course_id = c.course_id
             JOIN classrooms cr ON s.classroom_id = cr.classroom_id
             JOIN timeslots t ON s.timeslot_id = t.timeslot_id
             JOIN teachers te ON c.teacher_id = te.teacher_id
             WHERE c.semester_id = ? AND s.schedule_date >= CURDATE() AND s.status = 'scheduled'
             ORDER BY s.schedule_date, t.slot_no`,
            [semesterId]
        );
        return rows;
    }

    static async findTeacherSchedules(teacherId) {
        const [rows] = await pool.execute(
            `SELECT s.schedule_id, s.schedule_date, c.course_code, c.course_title,
                    cr.room_number, t.start_time, t.end_time, t.slot_no
             FROM schedules s
             JOIN courses c ON s.course_id = c.course_id
             JOIN classrooms cr ON s.classroom_id = cr.classroom_id
             JOIN timeslots t ON s.timeslot_id = t.timeslot_id
             WHERE c.teacher_id = ? AND s.schedule_date >= CURDATE() AND s.status = 'scheduled'
             ORDER BY s.schedule_date, t.slot_no`,
            [teacherId]
        );
        return rows;
    }

    static async findByDateAndSlot(date, timeslotId) {
        const [rows] = await pool.execute(
            `SELECT s.*, c.course_code, c.course_title, cr.room_number
             FROM schedules s
             JOIN courses c ON s.course_id = c.course_id
             JOIN classrooms cr ON s.classroom_id = cr.classroom_id
             WHERE s.schedule_date = ? AND s.timeslot_id = ? AND s.status = 'scheduled'`,
            [date, timeslotId]
        );
        return rows;
    }

    static async findClassroomConflict(classroomId, date, timeslotId) {
        const [rows] = await pool.execute(
            `SELECT schedule_id FROM schedules 
             WHERE classroom_id = ? AND schedule_date = ? 
             AND timeslot_id = ? AND status = 'scheduled'`,
            [classroomId, date, timeslotId]
        );
        return rows[0];
    }

    static async findTeacherConflict(teacherId, date, timeslotId) {
        const [rows] = await pool.execute(
            `SELECT s.schedule_id 
             FROM schedules s
             JOIN courses c ON s.course_id = c.course_id
             WHERE c.teacher_id = ? AND s.schedule_date = ? 
             AND s.timeslot_id = ? AND s.status = 'scheduled'`,
            [teacherId, date, timeslotId]
        );
        return rows[0];
    }

    static async findSemesterConflict(semesterId, date, timeslotId) {
        const [rows] = await pool.execute(
            `SELECT s.schedule_id 
             FROM schedules s
             JOIN courses c ON s.course_id = c.course_id
             WHERE c.semester_id = ? AND s.schedule_date = ? 
             AND s.timeslot_id = ? AND s.status = 'scheduled'`,
            [semesterId, date, timeslotId]
        );
        return rows[0];
    }

    static async create(scheduleData) {
        const { courseId, classroomId, timeslotId, scheduleDate } = scheduleData;
        const [result] = await pool.execute(
            `INSERT INTO schedules (course_id, classroom_id, timeslot_id, schedule_date) 
             VALUES (?, ?, ?, ?)`,
            [courseId, classroomId, timeslotId, scheduleDate]
        );
        return result.insertId;
    }

    static async cancel(scheduleId) {
        const [result] = await pool.execute(
            `UPDATE schedules SET status = 'cancelled' WHERE schedule_id = ?`,
            [scheduleId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Schedule;