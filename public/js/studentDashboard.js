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
        console.log('Dashboard data:', result); // Debug log
        
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



function renderScheduleGrid() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';
    
    const today = dashboardData.currentDate;
    
    if (!dashboardData.gridData || dashboardData.gridData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No classes scheduled for today and future dates</td></tr>';
        return;
    }
    
    const timeslots = dashboardData.timeslots;
    
    dashboardData.gridData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Date cell
        const dateCell = document.createElement('td');
        dateCell.className = 'date-cell';
        const rowDate = new Date(row.date + 'T00:00:00'); // Ensure correct date
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
        
        // Check if this date has any schedules
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
                    <div class="room">🏠 ${schedule.roomNumber}</div>
                    <div class="time">⏰ ${schedule.startTime}</div>
                `;
                slotCard.onclick = () => showClassDetails(schedule, row.date);
            } else {
                slotCard.classList.add('empty');
                // Show a subtle message only if the date has other classes
                if (hasAnySchedule) {
                    slotCard.innerHTML = `<span>📭 Free</span>`;
                } else {
                    slotCard.innerHTML = `<span style="color: #ccc;">—</span>`;
                }
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
    detailsPanel.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Course Code</div>
            <div class="detail-value">${schedule.courseCode}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Course Name</div>
            <div class="detail-value">${schedule.courseTitle}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Teacher</div>
            <div class="detail-value">${schedule.teacherName || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Classroom</div>
            <div class="detail-value">${schedule.roomNumber}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">${schedule.startTime} - ${schedule.endTime}</div>
        </div>
    `;
}

function showEmptySlot(date, timeslot) {
    const detailsPanel = document.getElementById('detailsContent');
    detailsPanel.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">📭 Free Period</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Date</div>
            <div class="detail-value">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Time</div>
            <div class="detail-value">${timeslot.label}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Info</div>
            <div class="detail-value">No class scheduled. You can use this time for self-study.</div>
        </div>
    `;
}

function filterSchedule() {
    const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
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

// Add this function to studentDashboard.js
// Add this function to studentDashboard.js
function renderTableHeaders() {
    const thead = document.getElementById('tableHeader');
    if (!thead || !dashboardData.timeslots) return;
    
    const headerRow = document.createElement('tr');
    const dateHeader = document.createElement('th');
    dateHeader.textContent = 'Date';
    dateHeader.style.minWidth = '100px';
    headerRow.appendChild(dateHeader);
    
    dashboardData.timeslots.forEach(timeslot => {
        const th = document.createElement('th');
        th.textContent = timeslot.label; // Already formatted as "8:30 AM - 10:00 AM"
        th.style.minWidth = '120px';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
    });
    
    thead.innerHTML = '';
    thead.appendChild(headerRow);
}

// Update renderDashboard function to call renderTableHeaders
function renderDashboard() {
    // Update user info
    if (dashboardData.user.role === 'student') {
        document.getElementById('userName').textContent = dashboardData.user.name;
        document.getElementById('userBatch').textContent = dashboardData.user.batch;
        document.getElementById('userSemester').textContent = dashboardData.user.semester;
        document.getElementById('userRollNo').textContent = dashboardData.user.rollNo;
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
    
    // Render table headers
    renderTableHeaders();
    
    // Render schedule grid
    renderScheduleGrid();
}

// Call this function in renderDashboard() after dashboardData is loaded
// Add: renderTableHeaders();

// Search filter
document.getElementById('searchFilter')?.addEventListener('input', filterSchedule);

// Load dashboard
loadDashboard();