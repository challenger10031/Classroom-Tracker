const express = require('express');
const router = express.Router();

// Placeholder schedule routes
router.get('/', (req, res) => res.json({ ok: true, message: 'list schedules' }));
router.post('/', (req, res) => res.json({ ok: true, message: 'create schedule' }));

module.exports = router;
