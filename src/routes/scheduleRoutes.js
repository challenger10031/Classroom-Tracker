const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { teacherOnly } = require('../middleware/roleMiddleware');
const { 
    getDashboard, 
    getSchedulingData, 
    createSchedule, 
    cancelSchedule 
} = require('../controllers/scheduleController');

const router = express.Router();

// All schedule routes require authentication
router.use(authenticate);

// GET /api/dashboard - Get dashboard data for current user
router.get('/dashboard', getDashboard);

// GET /api/schedule-data - Get all data needed for scheduling (courses, rooms, timeslots)
router.get('/schedule-data', getSchedulingData);

// POST /api/schedule - Create a new schedule (teachers only)
router.post('/schedule', teacherOnly, createSchedule);

// PATCH /api/schedule/:id/cancel - Cancel a schedule (teachers only)
router.patch('/schedule/:id/cancel', teacherOnly, cancelSchedule);

module.exports = router;