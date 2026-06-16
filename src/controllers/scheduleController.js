const scheduleService = require('../services/scheduleService');

async function getDashboard(req, res) {
    try {
        const userId = req.userId;
        const userRole = req.user.role;
        
        console.log('Dashboard request - User ID:', userId, 'Role:', userRole);
        
        let dashboardData;
        
        if (userRole === 'student') {
            dashboardData = await scheduleService.getStudentDashboardData(userId);
        } else if (userRole === 'teacher') {
            dashboardData = await scheduleService.getTeacherDashboardData(userId);
        } else {
            dashboardData = await scheduleService.getAdminDashboardData();
        }
        
        // Log response summary
        console.log('Dashboard data prepared - Grid rows:', dashboardData.gridData.length);
        
        res.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

async function getSchedulingData(req, res) {
    try {
        const Timeslot = require('../models/Timeslot');
        const Classroom = require('../models/Classroom');
        const Course = require('../models/Course');
        const Teacher = require('../models/Teacher');
        
        const timeslots = await Timeslot.findAll();
        const classrooms = await Classroom.findAll();
        
        let courses = [];
        if (req.user.role === 'teacher') {
            const teacher = await Teacher.findByUserId(req.userId);
            if (teacher) {
                courses = await Teacher.findCourses(teacher.teacher_id);
            }
        }
        
        res.json({
            success: true,
            data: {
                timeslots,
                classrooms,
                courses
            }
        });
    } catch (error) {
        console.error('Scheduling data error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

async function createSchedule(req, res) {
    try {
        const { courseId, classroomId, timeslotId, scheduleDate } = req.body;
        const teacherId = req.userId;
        
        // Validate required fields
        if (!courseId || !classroomId || !timeslotId || !scheduleDate) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }
        
        const scheduleId = await scheduleService.createSchedule({
            courseId,
            classroomId,
            timeslotId,
            scheduleDate,
            teacherId
        });
        
        res.json({
            success: true,
            message: 'Schedule created successfully',
            scheduleId
        });
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(409).json({ 
            success: false, 
            error: error.message 
        });
    }
}

async function cancelSchedule(req, res) {
    try {
        const scheduleId = req.params.id;
        const result = await scheduleService.cancelSchedule(scheduleId);
        
        if (result) {
            res.json({
                success: true,
                message: 'Schedule cancelled successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Schedule not found'
            });
        }
    } catch (error) {
        console.error('Cancel schedule error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

module.exports = { getDashboard, getSchedulingData, createSchedule, cancelSchedule };