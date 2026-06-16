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

// GET /api/schedule/dashboard - Get dashboard data based on role
router.get('/dashboard', getDashboard);

// GET /api/schedule/scheduling-data - Get data for scheduling (teachers only)
router.get('/scheduling-data', teacherOnly, getSchedulingData);

// POST /api/schedule/create - Create new schedule (teachers only)
router.post('/create', teacherOnly, createSchedule);

// DELETE /api/schedule/:id/cancel - Cancel a schedule (teachers only)
router.delete('/:id/cancel', teacherOnly, cancelSchedule);

module.exports = router;