
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

        // State
        let clients = [];
        let activeClientId = null;
        let timerInterval = null;
        let startTime = null;
        let currentModalClientId = null;
        let weeklyChartInstance = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            const userId = window.userId;
            if(userId){
                fetch(`/api/clients/getClients/${userId}`)
                    .then(res => res.json())
                    .then(data => {
                        clients = data;
                        console.log("Clients: ", clients);
                        renderClientList();
                        updateTodaySummary();
                        renderWeeklyChart();
                        renderTimeDistributionChart();
                    });
            } else {
                console.log("No Clients");
                renderClientList();
            }
            
            
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

        async function addClient(name) {
            const rate = parseFloat(document.getElementById('clientRate').value) || 0;
            const userId = window.userId;
            const newClient = {
                userId: userId,
                name: name,
                rate: rate,
                totalTime: 0,
                sessions: [],
                notes: '',
                createdAt: new Date().toISOString()
            };
            console.log("Sending new client", newClient);

            try{
                const response = await fetch('/api/clients/addClient', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newClient)
                });
                const data = await response.json();
                console.log('Client added:', data);
            } catch (error) {
                console.error('Error adding client:', error);
            }

            clients.push(newClient);
            renderClientList();
            
            // Show success animation
            const success = document.createElement('div');
            success.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center slide-in';
            success.innerHTML = `<i class="fas fa-check-circle mr-2"></i> Client "${name}" added successfully`;
            document.body.appendChild(success);
            setTimeout(() => {
                success.classList.remove('slide-in');
                success.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => success.remove(), 300);
            }, 3000);
        }

        async function updateClient(clientID){
            const client = clients.find(c => c._id === clientID);
            if (!client) return;

            const updatedClient = {
                ...client,
                name: document.getElementById(`clientName-${clientID}`).value,
                rate: parseFloat(document.getElementById(`clientRate-${clientID}`).value) || 0,
                notes: document.getElementById(`clientNotes-${clientID}`).value
            };

            try {
                const response = await fetch(`/api/clients/updateClient/${clientID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedClient)
                });
                const data = await response.json();
                console.log('Client updated:', data);
            } catch (error) {
                console.error('Error updating client:', error);
            }

            const clientIndex = clients.findIndex(c => c._id === clientID);
            if (clientIndex !== -1) {
                clients[clientIndex] = updatedClient;
            }

            renderClientList();
        }

        function startTimer(clientId) {
            if (activeClientId) {
                stopTimer();
            }
            
            activeClientId = clientId;
            startTime = new Date();
            
            const client = clients.find(c => c._id === clientId);
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
            
            const clientIndex = clients.findIndex(c => c._id === activeClientId);
            if (clientIndex !== -1) {
                clients[clientIndex].totalTime += duration;
                clients[clientIndex].sessions.push({
                    start: startTime.toISOString(),
                    end: endTime.toISOString(),
                    duration
                });
            }
            updateClient(activeClientId);
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
            notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center slide-in';
            notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i> Time tracking session saved`;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.classList.remove('slide-in');
                notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        function renderClientList() {
            if (!Array.isArray(clients)) {
                console.error("Clients is not an array");
                return;
            }else{
                console.log("Now rendering client list ... with ", clients.length, "clients");
            }
            if (clients.length === 0) {
                clientList.innerHTML = `
                    <div class="p-4 text-center text-gray-500">
                        <p>No clients added yet. Add your first client above.</p>
                    </div>
                `;
                return;
            }
            
            clientList.innerHTML = '';
            
            clients.forEach(client => {
                const isActive = client._id === activeClientId;
                const totalHours = Math.floor(client.totalTime / 3600);
                const totalMinutes = Math.floor((client.totalTime % 3600) / 60);
                
                const clientElement = document.createElement('div');
                clientElement.className = `p-4 hover:bg-gray-50 transition ${isActive ? 'bg-blue-50' : ''}`;
                clientElement.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="font-medium">${client.name}</h3>
                            <p class="text-sm text-gray-500">${totalHours}h ${totalMinutes}m total</p>
                        </div>
                        <div class="flex gap-2">
                            ${isActive ? `
                                <button class="text-gray-400 cursor-default" disabled>
                                    <i class="fas fa-play text-green-500"></i>
                                </button>
                            ` : `
                                <button onclick="startTimer('${client._id}')" class="text-gray-600 hover:text-green-600 transition">
                                    <i class="fas fa-play"></i>
                                </button>
                            `}
                            <button onclick="openClientModal('${client._id}')" class="text-gray-600 hover:text-blue-600 transition">
                                <i class="fas fa-info-circle"></i>
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
                        activeClientsToday.add(client._id);
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
            // Destroy previous chart instance if exists
            if (weeklyChartInstance) {
                weeklyChartInstance.destroy();
            }
            
            // Get last 7 days
            const dates = [];
            const now = new Date();
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
            }
            
            // Calculate time per day
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
            
            // Format dates for display (e.g., "Mon 12")
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
            const client = clients.find(c => c._id === clientId);
            if (!client) return;
            
            currentModalClientId = clientId;
            modalClientName.textContent = client.name;
            modalNotes.value = client.notes || '';
            
            // Calculate total time
            const hours = Math.floor(client.totalTime / 3600);
            const minutes = Math.floor((client.totalTime % 3600) / 60);
            modalTotalTime.textContent = `${hours}h ${minutes}m`;

            // Calculate total bill
            modalRate.textContent = `$${client.rate.toFixed(2)}/hr`;
            const hoursWorked = client.totalTime / 3600;
            const bill = hoursWorked * client.rate;
            modalTotalBill.textContent = `$${bill.toFixed(2)}`;

            // Render sessions
            modalSessions.innerHTML = '';
            if (client.sessions.length === 0) {
                modalSessions.innerHTML = '<p class="text-gray-500 text-center py-4">No sessions recorded yet</p>';
            } else {
                client.sessions.slice().reverse().forEach(session => {
                    const sessionElement = document.createElement('div');
                    sessionElement.className = 'bg-gray-50 p-3 rounded-lg';
                    
                    const startDate = new Date(session.start);
                    const endDate = new Date(session.end);
                    const durationHours = Math.floor(session.duration / 3600);
                    const durationMinutes = Math.floor((session.duration % 3600) / 60);
                    
                    sessionElement.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-medium">${startDate.toLocaleDateString()}</p>
                                <p class="text-sm text-gray-500">${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                            <p class="font-medium">${durationHours}h ${durationMinutes}m</p>
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
            
            const clientIndex = clients.findIndex(c => c._id === currentModalClientId);
            if (clientIndex !== -1) {
                clients[clientIndex].notes = modalNotes.value;
                
                // Show success notification
                const notification = document.createElement('div');
                notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center slide-in';
                notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i> Notes saved`;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.classList.remove('slide-in');
                    notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
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
            
            clients = clients.filter(c => c._id !== currentModalClientId);
            closeModal();
            renderClientList();
            updateTodaySummary();
            renderWeeklyChart();
            
            // Show deletion notification
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center slide-in';
            notification.innerHTML = `<i class="fas fa-trash mr-2"></i> Client deleted`;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.classList.remove('slide-in');
                notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
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
            
            // Show export notification
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center slide-in';
            notification.innerHTML = `<i class="fas fa-file-export mr-2"></i> Data exported successfully`;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.classList.remove('slide-in');
                notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
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
            renderClientList();
            updateTodaySummary();
            renderWeeklyChart();
            
            // Show clear notification
            const notification = document.createElement('div');
            notification.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center slide-in';
            notification.innerHTML = `<i class="fas fa-trash mr-2"></i> All data cleared`;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.classList.remove('slide-in');
                notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        function renderTimeDistributionChart() {
            const ctx = document.getElementById('timeDistributionChart').getContext('2d');
            
            // Filter clients with some time tracked
            const activeClients = clients.filter(client => client.totalTime > 0);
            
            if (activeClients.length === 0) {
                document.getElementById('timeDistributionChart').parentElement.innerHTML += `
                    <p class="text-gray-500 text-center py-4">No time tracked yet</p>
                `;
                return;
            }
            
            // Sort clients by time (descending)
            activeClients.sort((a, b) => b.totalTime - a.totalTime);
            
            // Prepare data for chart
            const labels = activeClients.map(client => client.name);
            const data = activeClients.map(client => client.totalTime / 3600); // Convert to hours
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
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const hours = context.raw;
                                    const minutes = Math.round((hours % 1) * 60);
                                    return `${Math.floor(hours)}h ${minutes}m (${context.label})`;
                                }
                            }
                        }
                    },
                    cutout: '70%'
                }
            });
        }

        // Make functions available globally for inline event handlers
        window.startTimer = startTimer;
        window.openClientModal = openClientModal;
    

function makeInvoice(client, dff){
    // Build sessions HTML
    const sessionsHTML = client.sessions.map(session => {
        const start = new Date(session.start);
        const end = new Date(session.end);
        const duration = session.duration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `
            <tr>
                <td>${start.toLocaleDateString()}</td>
                <td>${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td>${hours}h ${minutes}m</td>
            </tr>
        `;
    }).join('');

    // Modern HTML invoice
    return`
        <html>
        <head>
            <title>Invoice for ${client.name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    background: #f3f4f6;
                    font-family: 'Segoe UI', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .invoice-container {
                    background: #fff;
                    max-width: 600px;
                    margin: 40px auto;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
                    padding: 32px;
                }
                .invoice-header {
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 16px;
                    margin-bottom: 24px;
                }
                .invoice-title {
                    font-size: 2em;
                    color: #1e40af;
                    margin: 0;
                }
                .invoice-meta {
                    color: #64748b;
                    font-size: 1em;
                    margin-top: 8px;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 24px 0;
                }
                .invoice-table th, .invoice-table td {
                    padding: 12px 8px;
                    text-align: left;
                }
                .invoice-table th {
                    background: #f1f5f9;
                    color: #1e293b;
                    font-weight: 600;
                    border-bottom: 1px solid #e5e7eb;
                }
                .invoice-table tr:nth-child(even) {
                    background: #f9fafb;
                }
                .invoice-total-row td {
                    font-weight: bold;
                    font-size: 1.1em;
                    color: #16a34a;
                    border-top: 2px solid #e5e7eb;
                }
                .invoice-footer {
                    margin-top: 32px;
                    color: #64748b;
                    font-size: 1em;
                    text-align: center;
                }
                @media (max-width: 640px) {
                    .invoice-container { padding: 12px; }
                    .invoice-title { font-size: 1.3em; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="invoice-header">
                    <h1 class="invoice-title">Invoice for ${client.name}</h1>
                    <div class="invoice-meta">Date: ${new Date().toLocaleDateString()}</div>
                </div>
                <div>
                    <strong>Hourly Rate:</strong> $${client.rate.toFixed(2)} / hr
                </div>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Session</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sessionsHTML}
                        <tr class="invoice-total-row">
                            <td colspan="2">Total Bill</td>
                            <td>$${((client.totalTime / 3600) * client.rate).toFixed(2)}</td>
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

    const client = clients.find(c => c._id === currentModalClientId);
    if (!client) return;

    let mssg = `<div style="margin:32px auto;max-width:600px;text-align:center;color:#64748b;">
                    <p><strong>Copy the invoice above and paste it into your email client.</strong></p>
                </div>`;

    const invoiceHTML = makeInvoice(client, mssg);

    /*// Optionally, prompt for recipient email
    const recipient = prompt("Enter the client's email address:");
    if (!recipient) return;

    // Create mailto link
    const subject = encodeURIComponent(`Invoice from Your Company`);
    const body = (invoiceHTML).html();
    const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

    // Open mail client
    window.location.href = mailtoLink; */

    // Open a new window with the invoice for copying
    const invoiceWindow = window.open('', '', 'width=800,height=900');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.focus();
}

function printInvoice() {
    if (!currentModalClientId) return;

    const client = clients.find(c => c._id === currentModalClientId);
    if (!client) return;

    // Invoice HTML content
    const invoiceHTML = makeInvoice(client);

    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write( invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
}
