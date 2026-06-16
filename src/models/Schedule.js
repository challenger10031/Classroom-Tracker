const { pool } = require('../database/db');

class Schedule {
    // Get schedules for a student's semester (all schedules, will filter by date in service)
    static async findStudentSchedules(semesterId) {
        const [rows] = await pool.execute(`
            SELECT s.schedule_id, s.schedule_date,
                   c.course_id, c.course_code, c.course_title,
                   cr.room_number,
                   ts.timeslot_id, ts.slot_no, ts.start_time, ts.end_time,
                   t.teacher_name
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            JOIN classrooms cr ON s.classroom_id = cr.classroom_id
            JOIN timeslots ts ON s.timeslot_id = ts.timeslot_id
            JOIN teachers t ON c.teacher_id = t.teacher_id
            WHERE c.semester_id = ?
            ORDER BY s.schedule_date, ts.slot_no
        `, [semesterId]);
        return rows;
    }

    // Get schedules for a teacher's courses
    static async findTeacherSchedules(teacherId) {
        const [rows] = await pool.execute(`
            SELECT s.schedule_id, s.schedule_date,
                   c.course_id, c.course_code, c.course_title,
                   cr.room_number,
                   ts.timeslot_id, ts.slot_no, ts.start_time, ts.end_time,
                   sem.semester_no
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            JOIN classrooms cr ON s.classroom_id = cr.classroom_id
            JOIN timeslots ts ON s.timeslot_id = ts.timeslot_id
            JOIN semesters sem ON c.semester_id = sem.semester_id
            WHERE c.teacher_id = ?
            ORDER BY s.schedule_date, ts.slot_no
        `, [teacherId]);
        return rows;
    }

    // Get all schedules (for admin)
    static async findAllSchedules() {
        const [rows] = await pool.execute(`
            SELECT s.schedule_id, s.schedule_date,
                   c.course_id, c.course_code, c.course_title,
                   cr.room_number,
                   ts.timeslot_id, ts.slot_no, ts.start_time, ts.end_time,
                   t.teacher_name,
                   sem.semester_no
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            JOIN classrooms cr ON s.classroom_id = cr.classroom_id
            JOIN timeslots ts ON s.timeslot_id = ts.timeslot_id
            JOIN teachers t ON c.teacher_id = t.teacher_id
            JOIN semesters sem ON c.semester_id = sem.semester_id
            ORDER BY s.schedule_date, ts.slot_no
        `);
        return rows;
    }

    // Check classroom conflict
    static async findClassroomConflict(classroomId, date, timeslotId) {
        const [rows] = await pool.execute(`
            SELECT schedule_id FROM schedules 
            WHERE classroom_id = ? AND schedule_date = ? AND timeslot_id = ?
        `, [classroomId, date, timeslotId]);
        return rows[0];
    }

    // Check teacher conflict
    static async findTeacherConflict(teacherId, date, timeslotId) {
        const [rows] = await pool.execute(`
            SELECT s.schedule_id 
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            WHERE c.teacher_id = ? AND s.schedule_date = ? AND s.timeslot_id = ?
        `, [teacherId, date, timeslotId]);
        return rows[0];
    }

    // Check semester conflict
    static async findSemesterConflict(semesterId, date, timeslotId) {
        const [rows] = await pool.execute(`
            SELECT s.schedule_id 
            FROM schedules s
            JOIN courses c ON s.course_id = c.course_id
            WHERE c.semester_id = ? AND s.schedule_date = ? AND s.timeslot_id = ?
        `, [semesterId, date, timeslotId]);
        return rows[0];
    }

    // Create new schedule
    static async create(scheduleData) {
        const { courseId, classroomId, timeslotId, scheduleDate } = scheduleData;
        const [result] = await pool.execute(`
            INSERT INTO schedules (course_id, classroom_id, timeslot_id, schedule_date)
            VALUES (?, ?, ?, ?)
        `, [courseId, classroomId, timeslotId, scheduleDate]);
        return result.insertId;
    }

    // Delete schedule (cancel)
    static async cancel(scheduleId) {
        const [result] = await pool.execute(`
            DELETE FROM schedules WHERE schedule_id = ?
        `, [scheduleId]);
        return result.affectedRows > 0;
    }
}

module.exports = Schedule;