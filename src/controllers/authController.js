const pool = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

exports.register = async (req, res) => {
	const { email, password, role } = req.body;
	if (!email || !password || !role) return res.status(400).json({ message: 'email, password and role required' });
	try {
		const [rows] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
		if (rows.length) return res.status(400).json({ message: 'User already exists' });
		const hash = await bcrypt.hash(password, 10);
		const [result] = await pool.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, role]);
		res.status(201).json({ user_id: result.insertId, email, role });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) return res.status(400).json({ message: 'email and password required' });
	try {
		const [rows] = await pool.query('SELECT user_id, password_hash, role FROM users WHERE email = ?', [email]);
		if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
		const user = rows[0];
		const ok = await bcrypt.compare(password, user.password_hash);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = jwt.sign({ sub: user.user_id, role: user.role, email }, JWT_SECRET, { expiresIn: '8h' });
		res.json({ token, user: { user_id: user.user_id, email, role: user.role } });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
