const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Classroom = require('../models/Classroom');
const Timeslot = require('../models/Timeslot');
const Semester = require('../models/Semester');

async function getDashboardData(userId, role) {
    let schedules;
    
    if (role === 'student') {
        const semester = await Semester.getCurrent();
        schedules = await Schedule.findStudentSchedules(semester?.semester_id, userId);
    } else if (role === 'teacher') {
        schedules = await Schedule.findTeacherSchedules(userId);
    } else {
        schedules = await Schedule.findFutureSchedules(30);
    }
    
    const timeslots = await Timeslot.findAll();
    const classrooms = await Classroom.findAll();
    
    return {
        schedules,
        timeslots,
        classrooms,
        role
    };
}

async function getSchedulingData() {
    const courses = await Course.getAll();
    const classrooms = await Classroom.findAll();
    const timeslots = await Timeslot.findAll();
    
    return {
        courses,
        classrooms,
        timeslots
    };
}

async function validateSchedule(scheduleData) {
    const { courseId, classroomId, timeslotId, scheduleDate } = scheduleData;
    
    // Get course details for teacher and semester info
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error('Course not found');
    }
    
    // Check teacher conflict
    const teacherConflict = await checkTeacherConflict(course.teacher_id, scheduleDate, timeslotId);
    if (teacherConflict) {
        throw new Error('Teacher has a scheduling conflict at this time');
    }
    
    // Check semester conflict (for students - ensures no overlapping classes for same semester)
    const semesterConflict = await checkSemesterConflict(course.semester_id, scheduleDate, timeslotId);
    if (semesterConflict) {
        throw new Error('A class for this semester is already scheduled at this time');
    }
    
    // Check classroom conflict
    const classroomConflict = await checkClassroomConflict(classroomId, scheduleDate, timeslotId);
    if (classroomConflict) {
        throw new Error('Classroom is already booked at this time');
    }
    
    return true;
}

async function checkTeacherConflict(teacherId, date, timeslotId) {
    return await Schedule.findTeacherConflict(teacherId, date, timeslotId);
}

async function checkSemesterConflict(semesterId, date, timeslotId) {
    return await Schedule.findSemesterConflict(semesterId, date, timeslotId);
}

async function checkClassroomConflict(classroomId, date, timeslotId) {
    return await Schedule.findClassroomConflict(classroomId, date, timeslotId);
}

async function createSchedule(scheduleData) {
    // Validate before creation
    await validateSchedule(scheduleData);
    
    const scheduleId = await Schedule.create(scheduleData);
    return scheduleId;
}

async function cancelSchedule(scheduleId) {
    const result = await Schedule.cancel(scheduleId);
    return result;
}

module.exports = {
    getDashboardData,
    getSchedulingData,
    validateSchedule,
    checkTeacherConflict,
    checkSemesterConflict,
    checkClassroomConflict,
    createSchedule,
    cancelSchedule
};