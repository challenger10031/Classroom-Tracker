const scheduleService = require('../services/scheduleService');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

async function getDashboard(req, res) {
    try {
        const userId = req.userId;
        const role = req.user.role;
        
        let dashboardData;
        
        if (role === 'student') {
            const student = await Student.findByUserId(userId);
            if (!student) {
                return res.status(404).json({ error: 'Student record not found' });
            }
            dashboardData = await scheduleService.getDashboardData(student.student_id, 'student');
        } else if (role === 'teacher') {
            const teacher = await Teacher.findByUserId(userId);
            if (!teacher) {
                return res.status(404).json({ error: 'Teacher record not found' });
            }
            dashboardData = await scheduleService.getDashboardData(teacher.teacher_id, 'teacher');
        } else {
            dashboardData = await scheduleService.getDashboardData(null, 'admin');
        }
        
        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
}

async function getSchedulingData(req, res) {
    try {
        const schedulingData = await scheduleService.getSchedulingData();
        res.json(schedulingData);
    } catch (error) {
        console.error('Scheduling data error:', error);
        res.status(500).json({ error: 'Failed to load scheduling data' });
    }
}

async function createSchedule(req, res) {
    try {
        const scheduleData = req.body;
        
        // Validate required fields
        if (!scheduleData.courseId || !scheduleData.classroomId || 
            !scheduleData.timeslotId || !scheduleData.scheduleDate) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const result = await scheduleService.createSchedule(scheduleData);
        res.status(201).json({ success: true, scheduleId: result });
    } catch (error) {
        console.error('Create schedule error:', error);
        
        if (error.message.includes('conflict')) {
            return res.status(409).json({ error: error.message });
        }
        
        res.status(500).json({ error: 'Failed to create schedule' });
    }
}

async function cancelSchedule(req, res) {
    try {
        const scheduleId = req.params.id;
        const result = await scheduleService.cancelSchedule(scheduleId);
        
        if (result) {
            res.json({ success: true, message: 'Schedule cancelled successfully' });
        } else {
            res.status(404).json({ error: 'Schedule not found' });
        }
    } catch (error) {
        console.error('Cancel schedule error:', error);
        res.status(500).json({ error: 'Failed to cancel schedule' });
    }
}

module.exports = { getDashboard, getSchedulingData, createSchedule, cancelSchedule };