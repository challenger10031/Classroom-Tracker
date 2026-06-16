const API_BASE_URL = window.location.origin;
let dashboardData = null;

async function loadDashboard() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/schedule/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/pages/login.html';
            }
            throw new Error('Failed to load dashboard');
        }

        const result = await response.json();

        if (result.success) {
            dashboardData = result.data;
            renderDashboard();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data');
    }
}

function renderDashboard() {
    // Update user info
    if (dashboardData.user?.role === 'student') {
        document.getElementById('userName').textContent = dashboardData.user.name || 'N/A';
        document.getElementById('userBatch').textContent = dashboardData.user.batch || 'N/A';
        document.getElementById('userSemester').textContent = dashboardData.user.semester || 'N/A';
        document.getElementById('userRollNo').textContent = dashboardData.user.rollNo || 'N/A';
    }

    // Update current date
    if (dashboardData.currentDate) {
        const currentDate = new Date(dashboardData.currentDate + 'T00:00:00');
        document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    renderTableHeaders();
    renderScheduleGrid();
}

function renderTableHeaders() {
    const thead = document.getElementById('tableHeader');
    if (!thead || !dashboardData.timeslots) return;

    const headerRow = document.createElement('tr');
    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Date';
    dateHeader.style.minWidth = '90px';
    dateHeader.style.position = 'sticky';
    dateHeader.style.left = '0';
    dateHeader.style.zIndex = '11';
    dateHeader.style.background = 'white';
    headerRow.appendChild(dateHeader);

    dashboardData.timeslots.forEach(timeslot => {
        const th = document.createElement('th');
        th.textContent = timeslot.label;
        th.style.minWidth = '110px';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
    });

    thead.innerHTML = '';
    thead.appendChild(headerRow);
}

function renderScheduleGrid() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';

    const today = dashboardData.currentDate;

    if (!dashboardData.gridData || dashboardData.gridData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No classes scheduled for today and future dates</td></tr>';
        return;
    }

    const timeslots = dashboardData.timeslots;

    dashboardData.gridData.forEach(row => {
        const tr = document.createElement('tr');

        // Date cell
        const dateCell = document.createElement('td');
        dateCell.className = 'date-cell';
        const rowDate = new Date(row.date + 'T00:00:00');
        const isToday = row.date === today;

        if (isToday) {
            tr.classList.add('current-day-row');
            dateCell.classList.add('current-day');
        }

        dateCell.innerHTML = `
            <strong>${rowDate.toLocaleDateString('en-US', { weekday: 'short' })}</strong><br>
            ${rowDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        `;
        tr.appendChild(dateCell);

        const hasAnySchedule = timeslots.some(timeslot => row.slots[timeslot.slotNo]);

        // Time slot cells
        for (let i = 0; i < timeslots.length; i++) {
            const timeslot = timeslots[i];
            const td = document.createElement('td');
            const schedule = row.slots[timeslot.slotNo];

            const slotCard = document.createElement('div');
            slotCard.className = 'slot-card';

            if (schedule) {
                slotCard.classList.add('occupied');
                slotCard.innerHTML = `
                    <div class="course-code">${schedule.courseCode}</div>
                    <div class="course-title">${schedule.courseTitle}</div>
                    <div class="room">🏠 ${schedule.roomNumber}</div>
                    <div class="time">⏰ ${schedule.startTime}</div>
                `;
                slotCard.onclick = () => showClassDetails(schedule, row.date);
            } else {
                slotCard.classList.add('empty');
                slotCard.innerHTML = hasAnySchedule
                    ? `<span style="font-size: 0.7rem; color: #999;">Free</span>`
                    : `<span style="font-size: 0.7rem; color: #ddd;">—</span>`;
                slotCard.onclick = () => showEmptySlot(row.date, timeslot);
            }

            td.appendChild(slotCard);
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });
}

function showClassDetails(schedule, date) {
    const detailsPanel = document.getElementById('detailsContent');
    if (!detailsPanel) return;

    const dateObj = new Date(date + 'T00:00:00');
    detailsPanel.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Course Code</div>
            <div class="detail-value">${schedule.courseCode || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Course Name</div>
            <div class="detail-value">${schedule.courseTitle || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Teacher</div>
            <div class="detail-value">${schedule.teacherName || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Classroom</div>
            <div class="detail-value">${schedule.roomNumber || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">${schedule.startTime || 'N/A'} - ${schedule.endTime || 'N/A'}</div>
        </div>
    `;
}

function showEmptySlot(date, timeslot) {
    const detailsPanel = document.getElementById('detailsContent');
    if (!detailsPanel) return;

    const dateObj = new Date(date + 'T00:00:00');
    detailsPanel.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">📭 Free Period</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">${timeslot ? timeslot.label : 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Info</div>
            <div class="detail-value">No class scheduled. You can use this time for self-study.</div>
        </div>
    `;
}

function filterSchedule() {
    const searchTerm = document.getElementById('searchFilter')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#scheduleBody tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('.slot-card');
        let shouldShow = false;

        if (searchTerm === '') {
            shouldShow = true;
        } else {
            cells.forEach(cell => {
                if (cell.classList.contains('occupied')) {
                    const text = cell.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        shouldShow = true;
                    }
                }
            });
        }

        row.style.display = shouldShow ? '' : 'none';
    });
}

function logout() {
    localStorage.clear();
    window.location.href = '/pages/login.html';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// Event listeners
document.getElementById('searchFilter')?.addEventListener('input', filterSchedule);

// Load dashboard
loadDashboard();