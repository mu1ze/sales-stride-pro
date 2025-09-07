// DOM Elements
const addClientForm = document.getElementById('addClientForm');
const clientNameInput = document.getElementById('clientName');
const clientList = document.getElementById('clientList');
const activeTimerContainer = document.getElementById('activeTimerContainer');
const activeClientName = document.getElementById('activeClientName');
const activeTimer = document.getElementById('activeTimer');
const stopTimerBtn = document.getElementById('stopTimerBtn');
const todayTotal = document.getElementById('todayTotal');
const todayClients = document.getElementById('todayClients');
const weeklyChart = document.getElementById('weeklyChart');
const exportBtn = document.getElementById('exportBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const clientModal = document.getElementById('clientModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalClientName = document.getElementById('modalClientName');
const modalTotalTime = document.getElementById('modalTotalTime');
const modalSessions = document.getElementById('modalSessions');
const modalNotes = document.getElementById('modalNotes');
const saveNotesBtn = document.getElementById('saveNotesBtn');
const deleteClientBtn = document.getElementById('deleteClientBtn');
const printInvoiceBtn = document.getElementById('printInvoiceBtn');
const sendInvoiceBtn = document.getElementById('sendInvoiceBtn');
const modalRate = document.getElementById('modalRate');
const modalTotalBill = document.getElementById('modalTotalBill');

// State
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let activeClientId = null;
let timerInterval = null;
let startTime = null;
let currentModalClientId = null;
let weeklyChartInstance = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderClientList();
    updateTodaySummary();
    renderWeeklyChart();
    renderTimeDistributionChart();
});

// Event Listeners
addClientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = clientNameInput.value.trim();
    if (name) {
        addClient(name);
        clientNameInput.value = '';
    }
});

sendInvoiceBtn.addEventListener('click', sendInvoice);
stopTimerBtn.addEventListener('click', stopTimer);
exportBtn.addEventListener('click', exportData);
clearAllBtn.addEventListener('click', confirmClearAll);
closeModalBtn.addEventListener('click', closeModal);
saveNotesBtn.addEventListener('click', saveNotes);
deleteClientBtn.addEventListener('click', confirmDeleteClient);
printInvoiceBtn.addEventListener('click', printInvoice);

// Functions
function addClient(name) {
    const rate = parseFloat(document.getElementById('clientRate').value) || 0;
    const newClient = {
        id: Date.now().toString(),
        name,
        rate,
        totalTime: 0,
        sessions: [],
        notes: '',
        createdAt: new Date().toISOString()
    };

    clients.push(newClient);
    saveClients();
    renderClientList();

    // Show success animation
    const success = document.createElement('div');
    success.className = 'notification success-notification slide-in';
    success.innerHTML = `<i class="fas fa-check-circle notification-icon"></i> Client "${name}" added successfully`;
    document.body.appendChild(success);
    setTimeout(() => {
        success.classList.remove('slide-in');
        success.classList.add('notification-fade-out');
        setTimeout(() => success.remove(), 300);
    }, 3000);
}

function startTimer(clientId) {
    if (activeClientId) {
        stopTimer();
    }

    activeClientId = clientId;
    startTime = new Date();

    const client = clients.find(c => c.id === clientId);
    activeClientName.textContent = client.name;
    activeTimerContainer.classList.remove('hidden');

    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // Update UI
    renderClientList();
}

function updateTimer() {
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);

    const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
    const seconds = (diff % 60).toString().padStart(2, '0');

    activeTimer.textContent = `${hours}:${minutes}:${seconds}`;
}

function stopTimer() {
    if (!activeClientId || !timerInterval) return;

    clearInterval(timerInterval);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);

    const clientIndex = clients.findIndex(c => c.id === activeClientId);
    if (clientIndex !== -1) {
        clients[clientIndex].totalTime += duration;
        clients[clientIndex].sessions.push({
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            duration
        });
        saveClients();
    }

    activeClientId = null;
    startTime = null;
    timerInterval = null;
    activeTimerContainer.classList.add('hidden');

    // Update UI
    renderClientList();
    updateTodaySummary();
    renderWeeklyChart();

    // Show completion notification
    const notification = document.createElement('div');
    notification.className = 'notification info-notification slide-in';
    notification.innerHTML = `<i class="fas fa-check-circle notification-icon"></i> Time tracking session saved`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('slide-in');
        notification.classList.add('notification-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function renderClientList() {
    if (clients.length === 0) {
        clientList.innerHTML = `
            <div class="empty-state">
                <p>No clients added yet. Add your first client above.</p>
            </div>
        `;
        return;
    }

    clientList.innerHTML = '';

    clients.forEach(client => {
        const isActive = client.id === activeClientId;
        const totalHours = Math.floor(client.totalTime / 3600);
        const totalMinutes = Math.floor((client.totalTime % 3600) / 60);

        const clientElement = document.createElement('div');
        clientElement.className = `client-item ${isActive ? 'active-client' : ''}`;
        clientElement.innerHTML = `
            <div class="client-content">
                <div>
                    <h3 class="client-name-text">${client.name}</h3>
                    <p class="client-time">${totalHours}h ${totalMinutes}m total</p>
                </div>
                <div class="client-actions">
                    ${isActive ? `
                        <button class="client-button disabled-button" disabled>
                            <i class="fas fa-play action-icon-play"></i>
                        </button>
                    ` : `
                        <button  onclick="startTimer('${client.id}')" class="client-button start-button">
                            <i class="fas fa-play action-icon-play"></i>
                        </button>
                    `}
                    <button onclick="openClientModal('${client.id}')" class="client-button info-button">
                        <i class="fas fa-info-circle action-icon-info"></i>
                    </button>
                </div>
            </div>
        `;
        clientList.appendChild(clientElement);
    });
}

function updateTodaySummary() {
    const today = new Date().toISOString().split('T')[0];
    let totalSeconds = 0;
    let activeClientsToday = new Set();

    clients.forEach(client => {
        client.sessions.forEach(session => {
            const sessionDate = session.start.split('T')[0];
            if (sessionDate === today) {
                totalSeconds += session.duration;
                activeClientsToday.add(client.id);
            }
        });
    });

    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');

    todayTotal.textContent = `${hours}:${minutes}:${seconds}`;
    todayClients.textContent = activeClientsToday.size;
}

function renderWeeklyChart() {
    if (weeklyChartInstance) {
        weeklyChartInstance.destroy();
    }

    const dates = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }

    const timePerDay = dates.map(date => {
        let totalSeconds = 0;
        clients.forEach(client => {
            client.sessions.forEach(session => {
                const sessionDate = session.start.split('T')[0];
                if (sessionDate === date) {
                    totalSeconds += session.duration;
                }
            });
        });
        return totalSeconds / 3600; // Convert to hours
    });

    const formattedDates = dates.map(date => {
        const d = new Date(date);
        return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]} ${d.getDate()}`;
    });

    const ctx = weeklyChart.getContext('2d');
    weeklyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: formattedDates,
            datasets: [{
                label: 'Hours Tracked',
                data: timePerDay,
                backgroundColor: '#6366f1',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'h';
                        }
                    }
                }
            }
        }
    });
}

function openClientModal(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    currentModalClientId = clientId;
    modalClientName.textContent = client.name;
    modalNotes.value = client.notes || '';

    const hours = Math.floor(client.totalTime / 3600);
    const minutes = Math.floor((client.totalTime % 3600) / 60);
    modalTotalTime.textContent = `${hours}h ${minutes}m`;

    modalRate.textContent = `$${client.rate.toFixed(2)}/hr`;
    const hoursWorked = client.totalTime / 3600;
    const bill = hoursWorked * client.rate;
    modalTotalBill.textContent = `$${bill.toFixed(2)}`;

    modalSessions.innerHTML = '';
    if (client.sessions.length === 0) {
        modalSessions.innerHTML = '<p class="session-empty">No sessions recorded yet</p>';
    } else {
        client.sessions.slice().reverse().forEach(session => {
            const sessionElement = document.createElement('div');
            sessionElement.className = 'session-item';

            const startDate = new Date(session.start);
            const endDate = new Date(session.end);
            const durationHours = Math.floor(session.duration / 3600);
            const durationMinutes = Math.floor((session.duration % 3600) / 60);

            sessionElement.innerHTML = `
                <div class="session-content">
                    <div>
                        <p class="session-date">${startDate.toLocaleDateString()}</p>
                        <p class="session-time">${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <p class="session-duration">${durationHours}h ${durationMinutes}m</p>
                </div>
            `;
            modalSessions.appendChild(sessionElement);
        });
    }

    clientModal.classList.remove('hidden');
}

function closeModal() {
    clientModal.classList.add('hidden');
    currentModalClientId = null;
}

function saveNotes() {
    if (!currentModalClientId) return;

    const clientIndex = clients.findIndex(c => c.id === currentModalClientId);
    if (clientIndex !== -1) {
        clients[clientIndex].notes = modalNotes.value;
        saveClients();

        const notification = document.createElement('div');
        notification.className = 'notification success-notification slide-in';
        notification.innerHTML = `<i class="fas fa-check-circle notification-icon"></i> Notes saved`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.remove('slide-in');
            notification.classList.add('notification-fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

function confirmDeleteClient() {
    if (confirm('Are you sure you want to delete this client and all its time records? This cannot be undone.')) {
        deleteClient();
    }
}

function deleteClient() {
    if (!currentModalClientId) return;

    clients = clients.filter(c => c.id !== currentModalClientId);
    saveClients();
    closeModal();
    renderClientList();
    updateTodaySummary();
    renderWeeklyChart();

    const notification = document.createElement('div');
    notification.className = 'notification error-notification slide-in';
    notification.innerHTML = `<i class="fas fa-trash notification-icon"></i> Client deleted`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('slide-in');
        notification.classList.add('notification-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function exportData() {
    const data = {
        clients,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `client-time-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const notification = document.createElement('div');
    notification.className = 'notification info-notification slide-in';
    notification.innerHTML = `<i class="fas fa-file-export notification-icon"></i> Data exported successfully`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('slide-in');
        notification.classList.add('notification-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function confirmClearAll() {
    if (confirm('Are you sure you want to delete ALL clients and time records? This cannot be undone.')) {
        clearAllData();
    }
}

function clearAllData() {
    clients = [];
    saveClients();
    renderClientList();
    updateTodaySummary();
    renderWeeklyChart();

    const notification = document.createElement('div');
    notification.className = 'notification error-notification slide-in';
    notification.innerHTML = `<i class="fas fa-trash notification-icon"></i> All data cleared`;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('slide-in');
        notification.classList.add('notification-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function renderTimeDistributionChart() {
    const ctx = document.getElementById('timeDistributionChart').getContext('2d');

    const activeClients = clients.filter(client => client.totalTime > 0);

    if (activeClients.length === 0) {
        document.getElementById('timeDistributionChart').parentElement.innerHTML += `
            <p class="chart-empty">No time tracked yet</p>
        `;
        return;
    }

    activeClients.sort((a, b) => b.totalTime - a.totalTime);

    const labels = activeClients.map(client => client.name);
    const data = activeClients.map(client => client.totalTime / 3600);
    const backgroundColors = [
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#ff5722', '#ff9800', '#ffc107', '#4caf50'
    ].slice(0, activeClients.length);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 20
                    }
                },
 cade: function(context) {
                    const hours = context.raw;
                    const minutes = Math.round((hours % 1) * 60);
                    return `${Math.floor(hours)}h ${minutes}m (${context.label})`;
                }
            }
        },
        cutout: '70%'
    });
}

function saveClients() {
    localStorage.setItem('clients', JSON.stringify(clients));
}

function makeInvoice(client, dff) {
    const sessionsHTML = client.sessions.map(session => {
        const start = new Date(session.start);
        const end = new Date(session.end);
        const duration = session.duration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `
            <tr class="invoice-row">
                <td class="invoice-cell">${start.toLocaleDateString()}</td>
                <td class="invoice-cell">${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td class="invoice-cell">${hours}h ${minutes}m</td>
            </tr>
        `;
    }).join('');

    return `
        <html>
        <head>
            <title>Invoice for ${client.name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="dynamic-styles.css">
        </head>
        <body class="invoice-body">
            <div class="invoice-container">
                <div class="invoice-header">
                    <h1 class="invoice-title">Invoice for ${client.name}</h1>
                    <div class="invoice-meta">Date: ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="invoice-rate">
                    <strong>Hourly Rate:</strong> $${client.rate.toFixed(2)} / hr
                </div>
                <table class="invoice-table">
                    <thead>
                        <tr class="invoice-header-row">
                            <th class="invoice-header-cell">Date</th>
                            <th class="invoice-header-cell">Session</th>
                            <th class="invoice-header-cell">Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sessionsHTML}
                        <tr class="invoice-total-row">
                            <td class="invoice-cell" colspan="2">Total Bill</td>
                            <td class="invoice-cell invoice-total">$${((client.totalTime / 3600) * client.rate).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="invoice-footer">
                    Thank you for your business!
                </div>
            </div>
            ${dff || ''}
        </body>
        </html>
    `;
}

function sendInvoice() {
    if (!currentModalClientId) return;

    const client = clients.find(c => c.id === currentModalClientId);
    if (!client) return;

    let mssg = `<div class="email-instruction">
                    <p><strong>Copy the invoice above and paste it into your email client.</strong></p>
                </div>`;

    const invoiceHTML = makeInvoice(client, mssg);

    const invoiceWindow = window.open('', '', 'width=800,height=900');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.focus();
}

function printInvoice() {
    if (!currentModalClientId) return;

    const client = clients.find(c => c.id === currentModalClientId);
    if (!client) return;

    const invoiceHTML = makeInvoice(client);

    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
}

// Make functions available globally for inline event handlers
window.startTimer = startTimer;
window.openClientModal = openClientModal;