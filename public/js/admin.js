/**
 * Abyssinia Coffee - Admin Dashboard Controller
 * Features: Analytics, Inventory, Order Monitoring.
 */

const adminManager = {
    async init() {
        this.loadAnalytics();
        this.loadInventory();
        this.loadOrders();
    },

    async loadAnalytics() {
        try {
            const res = await fetch('api.php?controller=orders&action=list');
            const data = await res.json();
            if (data.success) {
                this.calculateRevenue(data.orders);
            }
        } catch (err) { console.error(err); }
    },

    calculateRevenue(orders) {
        const now = new Date();
        const stats = { day: 0, week: 0, month: 0, year: 0 };

        orders.forEach(order => {
            const date = new Date(order.order_date);
            const amt = parseFloat(order.total_amount);

            // Daily
            if (date.toDateString() === now.toDateString()) stats.day += amt;
            
            // Monthly
            if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) stats.month += amt;
            
            // Yearly
            if (date.getFullYear() === now.getFullYear()) stats.year += amt;

            // Weekly (approx last 7 days)
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) stats.week += amt;
        });

        document.getElementById('daily-rev').innerText = `$${stats.day.toFixed(2)}`;
        document.getElementById('weekly-rev').innerText = `$${stats.week.toFixed(2)}`;
        document.getElementById('monthly-rev').innerText = `$${stats.month.toFixed(2)}`;
        document.getElementById('yearly-rev').innerText = `$${stats.year.toFixed(2)}`;
    },

    async loadInventory() {
        try {
            const res = await fetch('api.php?controller=products&action=list');
            const data = await res.json();
            const tableBody = document.querySelector('#inventory-table tbody');
            
            if (data.products) {
                tableBody.innerHTML = data.products.map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td><code>${p.id}</code></td>
                        <td><strong style="color:${p.stock < 10 ? 'red' : 'green'}">${p.stock}</strong></td>
                        <td><input type="number" id="stock-${p.id}" value="${p.stock}" class="stock-input"></td>
                        <td><button class="btn-update" onclick="adminManager.updateStock('${p.id}')">Update</button></td>
                    </tr>
                `).join('');
            }
        } catch (err) { console.error(err); }
    },

    async updateStock(id) {
        const newStock = document.getElementById(`stock-${id}`).value;
        try {
            const res = await fetch('api.php?controller=products&action=update_stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, stock: newStock })
            });
            const result = await res.json();
            if (result.success) {
                alert('Stock updated successfully');
                this.loadInventory();
            }
        } catch (err) { console.error(err); }
    },

    async loadOrders() {
        try {
            const res = await fetch('api.php?controller=orders&action=list');
            const data = await res.json();
            const tableBody = document.querySelector('#orders-table tbody');
            
            if (data.orders) {
                tableBody.innerHTML = data.orders.map(o => `
                    <tr>
                        <td>#${o.id}</td>
                        <td>${o.username}</td>
                        <td>$${o.total_amount}</td>
                        <td>${new Date(o.order_date).toLocaleString()}</td>
                    </tr>
                `).join('');
            }
        } catch (err) { console.error(err); }
    }
};

function showSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('page-title').innerText = id.charAt(0).toUpperCase() + id.slice(1);
}

adminManager.init();
