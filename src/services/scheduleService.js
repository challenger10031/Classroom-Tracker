const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Schedule = require('../models/Schedule');
const Timeslot = require('../models/Timeslot');
const Classroom = require('../models/Classroom');
const Batch = require('../models/Batch');


// Get current date in Bangladesh timezone (UTC+6) as YYYY-MM-DD
function getCurrentDateInBD() {
    const now = new Date();
    // Convert to Bangladesh time (UTC+6)
    const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    return bdTime.toISOString().split('T')[0];
}

// Format time to 12-hour format
function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Convert date to YYYY-MM-DD format for comparison
function toDateString(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// Filter schedules to only include today and future dates
function filterTodayAndFutureSchedules(schedules, currentDate) {
    if (!schedules || schedules.length === 0) return [];
    
    console.log('Filtering schedules with current date:', currentDate);
    
    return schedules.filter(schedule => {
        const scheduleDateStr = toDateString(schedule.schedule_date);
        return scheduleDateStr >= currentDate;
    });
}

// Group schedules by date - stores schedules in a map by date
function groupSchedulesByDate(schedules) {
    const schedulesByDate = {};
    
    schedules.forEach(schedule => {
        const date = toDateString(schedule.schedule_date);
        const slotNo = schedule.slot_no;
        
        if (!schedulesByDate[date]) {
            schedulesByDate[date] = {};
        }
        
        schedulesByDate[date][slotNo] = {
            scheduleId: schedule.schedule_id,
            courseId: schedule.course_id,
            courseCode: schedule.course_code,
            courseTitle: schedule.course_title,
            roomNumber: schedule.room_number,
            teacherName: schedule.teacher_name || schedule.teacherName,
            startTime: formatTime(schedule.start_time),
            endTime: formatTime(schedule.end_time),
            semester: schedule.semester_no
        };
    });
    
    return schedulesByDate;
}

// Generate consecutive dates from startDate to endDate (30 days from start)
function generateDateRange(startDate, numberOfDays = 30) {
    const dates = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < numberOfDays; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
}

// Build grid data with all dates (including empty ones)
function buildCompleteGridData(schedulesByDate, dateRange, timeslots) {
    const gridData = [];
    
    dateRange.forEach(date => {
        const row = {
            date: date,
            slots: {}
        };
        
        // Initialize all slots as null
        timeslots.forEach(slot => {
            row.slots[slot.slot_no] = null;
        });
        
        // Fill in occupied slots if they exist for this date
        if (schedulesByDate[date]) {
            Object.keys(schedulesByDate[date]).forEach(slotNo => {
                row.slots[slotNo] = schedulesByDate[date][slotNo];
            });
        }
        
        gridData.push(row);
    });
    
    return gridData;
}

async function getStudentDashboardData(userId) {
    try {
        // Get student info
        const student = await Student.findByUserId(userId);
        if (!student) {
            throw new Error('Student not found');
        }
        
        console.log('Student found:', student.student_name, 'Semester:', student.semester_id);
        
        // Get all schedules for student's semester
        const allSchedules = await Schedule.findStudentSchedules(student.semester_id);
        console.log('Total schedules found for semester:', allSchedules.length);
        
        // Get all timeslots
        const timeslots = await Timeslot.findAll();
        console.log('Timeslots found:', timeslots.length);
        
        // Get all classrooms
        const classrooms = await Classroom.findAll();
        console.log('Classrooms found:', classrooms.length);
        
        // Get courses for this semester
        const courses = await Course.getCoursesBySemester(student.semester_id);
        
        // Get current date in Bangladesh timezone
        const currentDate = getCurrentDateInBD();
        console.log('Current date (BD):', currentDate);
        
        // Filter schedules to only today and future
        const futureSchedules = filterTodayAndFutureSchedules(allSchedules, currentDate);
        console.log('Future schedules (today onwards):', futureSchedules.length);
        
        // Group schedules by date
        const schedulesByDate = groupSchedulesByDate(futureSchedules);
        console.log('Dates with schedules:', Object.keys(schedulesByDate));
        
        // Generate date range (30 days from today)
        const dateRange = generateDateRange(currentDate, 30);
        console.log('Date range generated:', dateRange.length, 'days');
        
        // Build complete grid data with all dates
        const gridData = buildCompleteGridData(schedulesByDate, dateRange, timeslots);
        console.log('Grid data rows:', gridData.length);
        
        // Format timeslots for display
        const formattedTimeslots = timeslots.map(ts => ({
            timeslotId: ts.timeslot_id,
            slotNo: ts.slot_no,
            startTime: formatTime(ts.start_time),
            endTime: formatTime(ts.end_time),
            label: `${formatTime(ts.start_time)} - ${formatTime(ts.end_time)}`
        }));
        
        return {
            user: {
                name: student.student_name,
                rollNo: student.roll_no,
                batch: student.batch_name,
                semester: student.semester_no,
                role: 'student'
            },
            gridData,
            timeslots: formattedTimeslots,
            classrooms,
            courses,
            currentDate
        };
    } catch (error) {
        console.error('Error in getStudentDashboardData:', error);
        throw error;
    }
}

// Similar updates for getTeacherDashboardData and getAdminDashboardData...
// (Apply the same pattern to these functions)

async function getTeacherDashboardData(userId) {
    try {
        const teacher = await Teacher.findByUserId(userId);
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        
        console.log('Teacher found:', teacher.teacher_name);
        
        const allSchedules = await Schedule.findTeacherSchedules(teacher.teacher_id);
        console.log('Total schedules found for teacher:', allSchedules.length);
        
        const timeslots = await Timeslot.findAll();
        const classrooms = await Classroom.findAll();
        const courses = await Teacher.findCourses(teacher.teacher_id);
        
        const currentDate = getCurrentDateInBD();
        console.log('Current date (BD):', currentDate);
        
        const futureSchedules = filterTodayAndFutureSchedules(allSchedules, currentDate);
        console.log('Future schedules (today onwards):', futureSchedules.length);
        
        const schedulesByDate = groupSchedulesByDate(futureSchedules);
        const dateRange = generateDateRange(currentDate, 30);
        const gridData = buildCompleteGridData(schedulesByDate, dateRange, timeslots);
        
        const formattedTimeslots = timeslots.map(ts => ({
            timeslotId: ts.timeslot_id,
            slotNo: ts.slot_no,
            startTime: formatTime(ts.start_time),
            endTime: formatTime(ts.end_time),
            label: `${formatTime(ts.start_time)} - ${formatTime(ts.end_time)}`
        }));
        
        return {
            user: {
                name: teacher.teacher_name,
                department: teacher.department,
                role: 'teacher'
            },
            gridData,
            timeslots: formattedTimeslots,
            classrooms,
            courses,
            currentDate
        };
    } catch (error) {
        console.error('Error in getTeacherDashboardData:', error);
        throw error;
    }
}

async function getAdminDashboardData() {
    try {
        const allSchedules = await Schedule.findAllSchedules();
        console.log('Total schedules found:', allSchedules.length);
        
        const timeslots = await Timeslot.findAll();
        const classrooms = await Classroom.findAll();
        
        const currentDate = getCurrentDateInBD();
        console.log('Current date (BD):', currentDate);
        
        const futureSchedules = filterTodayAndFutureSchedules(allSchedules, currentDate);
        console.log('Future schedules (today onwards):', futureSchedules.length);
        
        const schedulesByDate = groupSchedulesByDate(futureSchedules);
        const dateRange = generateDateRange(currentDate, 30);
        const gridData = buildCompleteGridData(schedulesByDate, dateRange, timeslots);
        
        const formattedTimeslots = timeslots.map(ts => ({
            timeslotId: ts.timeslot_id,
            slotNo: ts.slot_no,
            startTime: formatTime(ts.start_time),
            endTime: formatTime(ts.end_time),
            label: `${formatTime(ts.start_time)} - ${formatTime(ts.end_time)}`
        }));
        
        return {
            user: {
                role: 'admin'
            },
            gridData,
            timeslots: formattedTimeslots,
            classrooms,
            currentDate
        };
    } catch (error) {
        console.error('Error in getAdminDashboardData:', error);
        throw error;
    }
}

async function validateSchedule(scheduleData) {
    const { courseId, classroomId, timeslotId, scheduleDate, userId } = scheduleData;
    //console.table(scheduleData);
    const course = await Course.findById(courseId);
    const teacher = await Teacher.findByUserId(userId);
    console.table(teacher);
    
    if (!course) {
        throw new Error('Course not found');
    }
    
    if (parseInt(course.teacher_id) !== parseInt(teacher.teacher_id)) {
        console.table(scheduleData);
        console.table(course);
        throw new Error('You are not authorized to schedule this course');
    }
    
    const currentDate = getCurrentDateInBD();
    if (scheduleDate < currentDate) {
        throw new Error('Cannot schedule classes in the past');
    }
    
    const classroomConflict = await Schedule.findClassroomConflict(classroomId, scheduleDate, timeslotId);
    if (classroomConflict) {
        throw new Error('Classroom is already booked for this time slot');
    }
    
    const teacherConflict = await Schedule.findTeacherConflict(teacher.teacher_id, scheduleDate, timeslotId);
    if (teacherConflict) {
        throw new Error('You already have a class scheduled at this time');
    }
    
    const semesterConflict = await Schedule.findSemesterConflict(course.semester_id, scheduleDate, timeslotId);
    if (semesterConflict) {
        throw new Error('A class for this semester is already scheduled at this time');
    }
    
    return true;
}

async function createSchedule(scheduleData) {
    await validateSchedule(scheduleData);
    const scheduleId = await Schedule.create(scheduleData);
    return scheduleId;
}

async function cancelSchedule(scheduleId, userId) {
    // Add validation to ensure the user is the owner of the schedule
    const schedule = await Schedule.findById(scheduleId);
    const teacher = await Teacher.findByUserId(userId);
    const course = await Course.findById(schedule.course_id);
    if (!schedule || course.teacher_id !== teacher.teacher_id) {
        throw new Error('You are not authorized to cancel this schedule');
    }

    // Check if the schedule date is in the past
    const currentDate = getCurrentDateInBD();
    const scheduleDateStr = toDateString(schedule.schedule_date);
    if (scheduleDateStr < currentDate) {
        throw new Error('Cannot cancel past schedules');
    }

    return await Schedule.cancel(scheduleId);
}

module.exports = {
    getStudentDashboardData,
    getTeacherDashboardData,
    getAdminDashboardData,
    validateSchedule,
    createSchedule,
    cancelSchedule,
    getCurrentDateInBD,
    formatTime,
    filterTodayAndFutureSchedules,
    toDateString,
    generateDateRange,
    buildCompleteGridData
};