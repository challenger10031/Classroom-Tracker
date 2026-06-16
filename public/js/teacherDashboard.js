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

function renderDashboard() {
    // Update user info
    if (dashboardData.user.role === 'teacher') {
        document.getElementById('userName').textContent = dashboardData.user.name;
        document.getElementById('userDepartment').textContent = dashboardData.user.department;
    }
    
    // Update current date
    if (dashboardData.currentDate) {
        const currentDate = new Date(dashboardData.currentDate);
        document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Render schedule grid
    renderScheduleGrid();
}
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
    if (dashboardData.user.role === 'teacher') {
        document.getElementById('userName').textContent = dashboardData.user.name;
        document.getElementById('userDepartment').textContent = dashboardData.user.department;
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
function renderScheduleGrid() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';
    
    const today = dashboardData.currentDate;
    
    if (!dashboardData.gridData || dashboardData.gridData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px;">No classes scheduled for today and future dates</td></tr>';
        return;
    }
    
    dashboardData.gridData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Date cell
        const dateCell = document.createElement('td');
        dateCell.className = 'date-cell';
        const rowDate = new Date(row.date);
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
        
        // Time slot cells - dynamically based on available timeslots
        const timeslots = dashboardData.timeslots;
        
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
                    <div class="semester">📖 ${schedule.semester || 'N/A'}</div>
                `;
                slotCard.onclick = () => showClassDetails(schedule, row.date);
            } else {
                slotCard.classList.add('empty');
                slotCard.innerHTML = `<span>📭 Free</span>`;
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
            <div class="detail-label">Semester</div>
            <div class="detail-value">${schedule.semester || 'N/A'}</div>
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
            <div class="detail-value">No class scheduled. You can schedule a class here.</div>
        </div>
        <button class="schedule-btn" onclick="openScheduleModal('${date}', ${timeslot.timeslotId})">
            + Schedule Class
        </button>
    `;
}

function openScheduleModal(date, timeslotId) {
    // Get available courses for this teacher
    const courses = dashboardData.courses || [];
    const classrooms = dashboardData.classrooms || [];
    
    let courseOptions = '<option value="">Select Course</option>';
    courses.forEach(course => {
        courseOptions += `<option value="${course.course_id}">${course.course_code} - ${course.course_title}</option>`;
    });
    
    let classroomOptions = '<option value="">Select Classroom</option>';
    classrooms.forEach(room => {
        classroomOptions += `<option value="${room.classroom_id}">${room.room_number}</option>`;
    });
    
    const modalHtml = `
        <div id="scheduleModal" class="modal">
            <div class="modal-content">
                <span class="close" onclick="closeModal()">&times;</span>
                <h3>Schedule New Class</h3>
                <form id="scheduleForm">
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="scheduleDate" value="${date}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Time Slot:</label>
                        <input type="text" value="${dashboardData.timeslots.find(ts => ts.timeslotId === timeslotId)?.label || ''}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Course:</label>
                        <select id="courseId" required>${courseOptions}</select>
                    </div>
                    <div class="form-group">
                        <label>Classroom:</label>
                        <select id="classroomId" required>${classroomOptions}</select>
                    </div>
                    <button type="submit">Schedule Class</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitSchedule(date, timeslotId);
    });
}

async function submitSchedule(date, timeslotId) {
    const courseId = document.getElementById('courseId').value;
    const classroomId = document.getElementById('classroomId').value;
    
    if (!courseId || !classroomId) {
        alert('Please select both course and classroom');
        return;
    }
    
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/schedule/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId,
                classroomId,
                timeslotId,
                scheduleDate: date
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Class scheduled successfully!');
            closeModal();
            loadDashboard(); // Refresh the dashboard
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error scheduling class:', error);
        alert('Failed to schedule class');
    }
}

function openScheduleModalForToday() {
    const today = dashboardData.currentDate;
    const firstTimeslot = dashboardData.timeslots[0];
    if (firstTimeslot) {
        openScheduleModal(today, firstTimeslot.timeslotId);
    }
}

function closeModal() {
    const modal = document.getElementById('scheduleModal');
    if (modal) modal.remove();
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

// Search filter
document.getElementById('searchFilter')?.addEventListener('input', filterSchedule);

// Load dashboard
loadDashboard();