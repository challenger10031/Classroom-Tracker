// login.js - handles login form POST to API
document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('login-form');
	const errEl = document.getElementById('error');
	if (!form) return;

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		errEl.textContent = '';
		const email = document.getElementById('email').value.trim();
		const password = document.getElementById('password').value;
		try {
			const res = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			const data = await res.json();
			if (!res.ok) {
				errEl.textContent = data.message || data.error || 'Login failed';
				return;
			}

			// Save token and user info
			if (data.token) localStorage.setItem('token', data.token);
			if (data.user && data.user.role) localStorage.setItem('role', data.user.role);

			// Redirect based on role
			const role = data.user && data.user.role;
			if (role === 'teacher') {
				window.location.href = '/pages/teacherDashboard.html';
			} else if (role === 'student') {
				window.location.href = '/pages/studentDashboard.html';
			} else {
				// default to schedule or dashboard
				window.location.href = '/pages/studentDashboard.html';
			}
		} catch (err) {
			console.error(err);
			errEl.textContent = 'Network error, try again.';
		}
	});
});
