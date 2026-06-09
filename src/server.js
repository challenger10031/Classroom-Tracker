const express = require('express');
require('dotenv').config();
const path = require('path');

const studentsRouter = require('./routes/students');
const authRouter = require('./routes/authRoutes');
const scheduleRouter = require('./routes/scheduleRoutes');

const app = express();
app.use(express.json());

// Serve static public files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/students', studentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/schedules', scheduleRouter);

app.get('/api', (req, res) => res.json({ ok: true, message: 'Classroom Tracker API' }));

// root serve login page by default
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'login.html')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
