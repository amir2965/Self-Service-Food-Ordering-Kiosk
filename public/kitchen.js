let lastProcessedOrder = 0;
let soundEnabled = true;
const orderStatus = new Map();
const LOCAL_STORAGE_KEY = 'kitchenOrderStatuses';
let previousOrders = new Set();

// Load saved statuses from localStorage
function loadSavedStatuses() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
        const statusMap = JSON.parse(saved);
        Object.entries(statusMap).forEach(([key, value]) => {
            orderStatus.set(parseInt(key), value);
        });
    }
}

// Save statuses to localStorage
function saveStatuses() {
    const statusObj = {};
    orderStatus.forEach((value, key) => {
        statusObj[key] = value;
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(statusObj));
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.querySelector('#soundToggle i');
    icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

function playNewOrderSound() {
    if (soundEnabled) {
        try {
            // Try system beep first
            new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1NOTEhGBEMCQcFAwIBAQEBAgMFBwkMEBghMTlMXWyFioWBZUo2JhoRCwcEAgEAAQIEBwsRGiY2SmVVPiUXDQcDAgEBAQMHDRclPmkFBwkMEBghMT%%%').play();
        } catch (e) {
            console.log('System beep failed, trying fallback sound');
            const audio = document.getElementById('newOrderSound');
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log('Audio play failed:', e));
            }
        }
    }
}

function createOrderCard(order) {
    const savedStatus = orderStatus.get(parseInt(order.orderNumber));
    const status = savedStatus || order.status || 'new';
    const card = document.createElement('div');
    card.className = `order-card ${status}`;
    card.dataset.orderNumber = order.orderNumber;

    card.innerHTML = `
        <div class="order-header">
            <div>
                <strong>#${order.orderNumber}</strong>
                <div class="customer-name">${order.customerName || 'Guest'}</div>
                <div>${order.orderTime || 'No time specified'}</div>
            </div>
            <div class="total-price">$${order.finalTotal}</div>
        </div>
        <div class="order-items">
            ${order.items.map(item => `
                <div class="item">
                    <div class="item-name">
                        ${item.category === 'Drinks' ? `
                            <div class="drink-item-container">
                                <img src="${findDrinkImage(item.title)}" alt="${item.title}" class="drink-image">
                                <div class="drink-info">
                                    <strong>${item.quantity}x ${item.title}</strong>
                                    <span class="drink-volume">${item.drinkVolume || item.size}</span>
                                    <span class="drink-price">$${item.price}</span>
                                </div>
                            </div>
                        ` : `
                            <strong>${item.quantity}x ${item.category} - ${item.title}</strong>
                            <span>$${item.price}</span>
                        `}
                    </div>
                    ${item.category !== 'Drinks' ? `
                        <div class="item-details">
                            <div><i class="fas fa-box"></i> Size: ${item.size}</div>
                            ${item.salads ? `<div><i class="fas fa-leaf"></i> Salads: ${item.salads}</div>` : ''}
                            ${item.sauces ? `<div><i class="fas fa-droplet"></i> Sauces: ${item.sauces}</div>` : ''}
                            ${item.extras ? `<div><i class="fas fa-plus"></i> Extras: ${item.extras}</div>` : ''}
                            ${item.addOns ? `<div><i class="fas fa-circle-plus"></i> Add-ons: ${item.addOns}</div>` : ''}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        <div class="order-actions">
            ${getActionButtons(order.orderNumber, status)}
        </div>
    `;

    return card;
}

// Add this new helper function to find drink images
function findDrinkImage(drinkTitle) {
    // Direct mapping for drink images
    const drinkImageMap = {
        'Coke': 'images/coke.png',
        'Water': 'images/water.png',
        'V Energy Drink - Guarana': 'images/v_energy.png',
        'Bundaberg - Ginger Beer': 'images/bundaberg_ginger.png',
        'Bundaberg - Burgundee Creaming Soda': 'images/bundaberg_creaming.png',
        'Bundaberg - Guava': 'images/bundaberg_guava.png',
        'Sprite - Natural Flavour': 'images/sprite.png',
        'Red Bull Energy Drink': 'images/redbull.png',
        'Solo - Lemon Flavour - Zero Sugar': 'images/solo_zero.png',  // Fixed the title to match exactly
        'Fanta - Orange': 'images/fanta_orange.png',
        'Pepsi': 'images/pepsi.png',
        'Pepsi Max': 'images/pepsi_max.png',
        'Maximus - Grape': 'images/maximus_grape.png',
        'Maximus - Red': 'images/maximus_red.png',
        'Coke - Zero Sugar': 'images/coke_zero.png',
        'Mojo - Orange Juice': 'images/mojo_orange.png',
        'Mojo - Apple Juice': 'images/mojo_apple.png',
        'Fuze Tea - Lemon': 'images/fuze_lemon.png',
        'Tea - ITO EN': 'images/ito_en.png',
        'Lipton - Peach': 'images/lipton_peach.png',
        'Lipton - Lemon': 'images/lipton_lemon.png',
        'Kirks - Lemon Squash': 'images/kirks_lemon.png',
        'Kirks - Portello': 'images/kirks_portello.png',
        'Monster - Energy Drink - Zero Ultra': 'images/monster_zero.png',
        'Mother - Energy Drink': 'images/mother_energy.png',
        'Powerade - Mountain Blast': 'images/powerade_mountain.png',
        'Powerade - Berry Ice': 'images/powerade_berry.png',
        'Cascade - Limon, Lime & Bitters': 'images/cascade_llb.png',
        'Cascade - Ginger Beer': 'images/cascade_ginger.png',
        'Coke Classic': 'images/coke_classic_600.png',
        'Coke Vanilla': 'images/coke_vanilla_600.png',
        'Gatorade - Blue Bolt': 'images/gatorade_blue.png',
        'Fanta - Raspberry - Zero Sugar': 'images/fanta_raspberry_zero.png'
    };

    // Try direct match first
    if (drinkImageMap[drinkTitle]) {
        console.log('Found exact match for:', drinkTitle);
        return drinkImageMap[drinkTitle];
    }

    // Try to match with volume variations and handle typos
    const normalizedTitle = drinkTitle
        .replace('Flavour-', 'Flavour -')  // Fix common typo in Solo title
        .split(' (')[0].trim();
    
    if (drinkImageMap[normalizedTitle]) {
        console.log('Found base match for:', normalizedTitle);
        return drinkImageMap[normalizedTitle];
    }

    // Handle special cases with volume indicators
    if (drinkTitle.includes('600mL')) {
        const base = baseTitle.replace('600mL', '').trim();
        if (base.includes('Coke Classic')) return 'images/coke_classic_600.png';
        if (base.includes('Coke Zero')) return 'images/coke_zero_600.png';
        if (base.includes('Sprite')) return 'images/sprite_600.png';
    }

    if (drinkTitle.includes('390mL')) {
        const base = baseTitle.replace('390mL', '').trim();
        if (base.includes('Fanta Orange')) return 'images/fanta_orange_390.png';
        if (base.includes('Coke Zero')) return 'images/coke_zero_390.png';
        if (base.includes('Coke Classic')) return 'images/coke_classic_390.png';
    }

    if (drinkTitle.includes('1.25L')) {
        const base = baseTitle.replace('1.25L', '').trim();
        if (base.includes('Fanta Orange')) return 'images/fanta_orange_1.25.png';
        if (base.includes('Coke Classic')) return 'images/coke_classic_1.25.png';
    }

    console.log('No image found for:', drinkTitle, 'using default');
    return 'images/default_drink.png';
}

function getActionButtons(orderNumber, status) {
    switch (status) {
        case 'new':
            return `<button class="action-button prepare-btn" onclick="updateStatus('${orderNumber}', 'preparing')">Start Preparing</button>`;
        case 'preparing':
            return `<button class="action-button ready-btn" onclick="updateStatus('${orderNumber}', 'ready')">Ready to Serve</button>`;
        case 'ready':
            return `<button class="action-button complete-btn" onclick="updateStatus('${orderNumber}', 'completed')">Complete Order</button>`;
        default:
            return '';
    }
}

function updateStatus(orderNumber, newStatus) {
    orderStatus.set(parseInt(orderNumber), newStatus);
    saveStatuses(); // Save to localStorage

    const orderCard = document.querySelector(`[data-order-number="${orderNumber}"]`);
    if (orderCard) {
        orderCard.className = `order-card ${newStatus}`;
        orderCard.querySelector('.order-actions').innerHTML = getActionButtons(orderNumber, newStatus);
        updateActiveOrderCount();
    }
}

function updateActiveOrderCount() {
    const activeOrders = document.querySelectorAll('.order-card:not(.completed)').length;
    document.getElementById('activeOrderCount').textContent = activeOrders;
}

async function fetchOrders() {
    try {
        console.log('Fetching orders...'); // Debug log
        const response = await fetch('/getOrders');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();
        console.log('Received orders:', orders); // Debug log
        
        // Check for new orders
        const currentOrderNumbers = new Set(orders.map(order => order.orderNumber));
        const newOrders = orders.filter(order => !previousOrders.has(order.orderNumber));
        
        // Play sound if there are new orders and sound is enabled
        if (newOrders.length > 0) {
            playNewOrderSound();
        }
        
        // Update previous orders
        previousOrders = currentOrderNumbers;
        
        const ordersGrid = document.getElementById('ordersGrid');
        if (!ordersGrid) {
            console.error('Orders grid element not found!');
            return;
        }
        
        // Clear the grid first
        ordersGrid.innerHTML = '';
        
        if (orders.length === 0) {
            ordersGrid.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-clipboard-list"></i>
                    <h2>No Active Orders</h2>
                    <p>When new orders arrive, they will appear here automatically.</p>
                </div>`;
            return;
        }
        
        // Process orders
        orders.forEach(order => {
            console.log('Processing order:', order); // Debug log
            const orderCard = createOrderCard(order);
            ordersGrid.appendChild(orderCard);
        });

        applyStatusFilter(); // Apply stored filter after loading orders
        updateActiveOrderCount();
        updateStatusCounts(); // Add this line after orders are processed

    } catch (error) {
        console.error('Error fetching orders:', error);
        const ordersGrid = document.getElementById('ordersGrid');
        if (ordersGrid) {
            ordersGrid.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Connection Error</h2>
                    <p>Unable to fetch orders. Please check your connection and refresh the page.</p>
                </div>`;
        }
    }
}

// Remove duplicate interval
clearInterval(window.orderInterval); // Clear any existing interval
window.orderInterval = setInterval(fetchOrders, 5000);

// Initial fetch
document.addEventListener('DOMContentLoaded', () => {
    console.log('Kitchen display initialized'); // Debug log
    loadSavedStatuses(); // Load saved statuses
    initializeDailyClear(); // Add daily clear check
    
    // Set the saved filter value
    const savedFilter = localStorage.getItem('selectedStatusFilter') || 'all';
    document.getElementById('statusFilter').value = savedFilter;
    
    fetchOrders();
    
    // Set up periodic check for daily clear
    setInterval(initializeDailyClear, 3600000); // Check every hour

    // Add click handlers for status tabs
    document.querySelectorAll('.status-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            filterOrders(tab.dataset.status);
        });
    });

    // Set initial status from localStorage
    const savedStatus = localStorage.getItem('selectedStatusFilter') || 'all';
    filterOrders(savedStatus);
});

function filterOrders(status) {
    const statusFilter = status || 'all';
    localStorage.setItem('selectedStatusFilter', statusFilter);

    // Update active tab
    document.querySelectorAll('.status-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.status === statusFilter);
    });

    // Filter orders
    const allOrders = document.querySelectorAll('.order-card');
    allOrders.forEach(order => {
        const orderStatus = Array.from(order.classList)
            .find(cls => cls !== 'order-card') || 'new';
        order.style.display = (statusFilter === 'all' || orderStatus === statusFilter) ? 'block' : 'none';
    });
}

function applyStatusFilter() {
    const statusFilter = localStorage.getItem('selectedStatusFilter') || 'all';
    document.getElementById('statusFilter').value = statusFilter;
    
    const allOrders = document.querySelectorAll('.order-card');
    allOrders.forEach(order => {
        const orderStatus = Array.from(order.classList)
            .find(cls => cls !== 'order-card')
            || 'new';
            
        if (statusFilter === 'all' || orderStatus === statusFilter) {
            order.style.display = 'block';
        } else {
            order.style.display = 'none';
        }
    });
}

function clearLocalStorage() {
    if (confirm('Warning: This will clear all cached order statuses. Are you sure you want to continue?')) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        orderStatus.clear();
        fetchOrders(); // Refresh the display
        showNotification('Cached order statuses have been cleared');
    }
}
function resetOrderNumbers() {
    if (confirm('Are you sure you want to reset order numbers to 101?')) {
        localStorage.setItem('currentOrderNumber', '101');
        fetchOrders(); // Refresh the display
        showNotification('Order numbers have been reset to 101');
    }
}

// Add notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update clearAllOrders function
async function clearAllOrders() {
    try {
        const PIN = "2965";
        const userInput = prompt('Enter PIN (2965) to clear all orders:');
        
        if (userInput !== PIN) {
            alert('Incorrect PIN');
            return;
        }
        
        if (!confirm('WARNING: This will permanently delete ALL orders. Are you sure?')) {
            return;
        }

        const response = await fetch('/clearOrders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ pin: PIN })
        });

        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Failed to clear orders');
        }

        showNotification('All orders have been cleared');
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear local storage
        orderStatus.clear(); // Clear status map
        await fetchOrders(); // Refresh the display
        updateActiveOrderCount(); // Update the counter

    } catch (error) {
        console.error('Error clearing orders:', error);
        alert('Failed to clear orders. Please try again.');
    }
}

// Update reset order numbers functionality with proper error handling
document.getElementById('resetOrderNumber').addEventListener('click', async function() {
    const pin = prompt('Enter PIN (2965) to reset order numbers:');
    if (pin !== '2965') {
        alert('Invalid PIN');
        return;
    }

    if (!confirm('Are you sure you want to reset order numbers to 101?')) {
        return;
    }

    try {
        // First backup all quick orders and critical data
        const backupItems = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('quickOrders_') || key === LOCAL_STORAGE_KEY)) {
                backupItems[key] = localStorage.getItem(key);
            }
        }

        // Reset in localStorage
        window.localStorage.clear();
        
        // Restore backed up items
        Object.entries(backupItems).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });
        
        // Set new order number
        window.localStorage.setItem('currentOrderNumber', '101');
        
        // Then reset in server
        const response = await fetch('/resetOrderNumber', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pin })
        });

        const data = await response.json();
        if (data.success) {
            alert('Order numbers have been reset to 101');
            showNotification('Order numbers reset - Quick orders preserved');
            window.location.reload(true);
        } else {
            throw new Error(data.error || 'Failed to reset order numbers');
        }
    } catch (error) {
        console.error('Error resetting order numbers:', error);
        alert('Failed to reset order numbers. Please try again.');
    }
});

// Event Listeners
document.getElementById('soundToggle').addEventListener('click', toggleSound);
document.getElementById('statusFilter').addEventListener('change', filterOrders);
document.getElementById('clearCache').addEventListener('click', clearLocalStorage);
document.getElementById('resetOrderNumber').addEventListener('click', resetOrderNumbers);
document.getElementById('clearAllOrders').addEventListener('click', clearAllOrders);

// Initial active order count
updateActiveOrderCount();

// Add this after initializeDailyClear() function
function initializeStorageCleanup() {
    const lastCleanupDate = localStorage.getItem('lastCleanupDate');
    const today = new Date().toDateString();
    
    // Check if cleanup has been done today
    if (lastCleanupDate !== today) {
        // Save all quick orders before clearing
        const quickOrders = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('quickOrders_')) {
                quickOrders[key] = localStorage.getItem(key);
            }
        }
        
        // Clear all localStorage except critical items
        const orderStatuses = localStorage.getItem(LOCAL_STORAGE_KEY); // Save order statuses
        localStorage.clear();
        
        // Restore quick orders
        Object.entries(quickOrders).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });
        
        // Restore order statuses
        if (orderStatuses) {
            localStorage.setItem(LOCAL_STORAGE_KEY, orderStatuses);
        }
        
        // Reset order number if needed
        if (!localStorage.getItem('currentOrderNumber')) {
            localStorage.setItem('currentOrderNumber', '101');
        }
        
        // Mark cleanup as done for today
        localStorage.setItem('lastCleanupDate', today);
        console.log('Daily storage cleanup completed, quick orders preserved');
    }
}

// Add daily localStorage cleanup function
function initializeDailyClear() {
    const lastClearDate = localStorage.getItem('lastClearDate');
    const today = new Date().toDateString();
    
    // Check if we haven't cleared today
    if (lastClearDate !== today) {
        // Save quick orders before clearing
        const backupItems = {};
        
        // Backup quick orders and critical kitchen data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('quickOrders_') || 
                       key === LOCAL_STORAGE_KEY || 
                       key === 'currentOrderNumber')) {
                backupItems[key] = localStorage.getItem(key);
            }
        }
        
        // Clear all localStorage
        localStorage.clear();
        
        // Restore backed up items
        Object.entries(backupItems).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });
        
        // Set last clear date
        localStorage.setItem('lastClearDate', today);
        console.log('Daily localStorage clear completed, critical data preserved:', backupItems);
    }
}

function updateStatusCounts() {
    const allOrders = document.querySelectorAll('.order-card');
    const counts = {
        all: allOrders.length,
        new: 0,
        preparing: 0,
        ready: 0,
        completed: 0
    };

    allOrders.forEach(order => {
        const status = Array.from(order.classList)
            .find(cls => cls !== 'order-card') || 'new';
        counts[status]++;
    });

    // Update the status tab counters
    Object.entries(counts).forEach(([status, count]) => {
        const countElement = document.getElementById(`count-${status}`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}
