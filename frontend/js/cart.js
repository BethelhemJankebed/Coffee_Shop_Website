/**
 * Abyssinia Coffee - Boutique Portfolio Controller (Cart & History)
 * Features: Checkout, History Tracking, Review System.
 */

const cartManager = {
    user: JSON.parse(localStorage.getItem('currentUser')),
    items: JSON.parse(localStorage.getItem('cart')) || [],

    async init() {
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }
        this.renderCart();
        this.loadHistory();
    },

    renderCart() {
        const container = document.getElementById('cart-items');
        const summary = document.getElementById('checkout-summary');
        
        if (this.items.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 40px; color: #666;">Your portfolio is currently empty. Explore our collection in the shop.</p>';
            summary.style.display = 'none';
            return;
        }

        summary.style.display = 'block';
        container.innerHTML = this.items.map((item, index) => `
            <div class="cart-item">
                <div class="cart-info">
                    <img src="${item.image}" class="cart-img" onerror="this.src='img/placeholder.png'">
                    <div>
                        <h4 style="margin:0">${item.name}</h4>
                        <p style="margin:5px 0; color: #666">$${item.price}</p>
                    </div>
                </div>
                <button onclick="cartManager.removeItem(${index})" style="color:red; background:none; border:none; cursor:pointer;">Remove</button>
            </div>
        `).join('');

        const total = this.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
        document.getElementById('total-price').innerText = `$${total.toFixed(2)}`;
    },

    removeItem(index) {
        this.items.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.renderCart();
    },

    async checkout() {
        const total = this.items.reduce((sum, item) => sum + parseFloat(item.price), 0);
        
        const orderData = {
            user_id: this.user.id,
            username: this.user.username,
            items: this.items,
            total: total,
            source: 'BOUTIQUE_WEB'
        };

        try {
            const response = await fetch('../backend/orders.php?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            if (result.success) {
                alert('Thank you for your order! Your boutique selection has been processed.');
                localStorage.removeItem('cart');
                this.items = [];
                this.renderCart();
                this.loadHistory();
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong during checkout.');
        }
    },

    async loadHistory() {
        try {
            const response = await fetch(`../backend/orders.php?action=user_orders&user_id=${this.user.id}`);
            const data = await response.json();
            
            const container = document.getElementById('order-history');
            if (!data.orders || data.orders.length === 0) {
                container.innerHTML = '<p>No past transactions found.</p>';
                return;
            }

            container.innerHTML = data.orders.map(order => `
                <div class="history-card">
                    <div>
                        <h3 style="margin:0">Order #${order.id}</h3>
                        <p style="color:#666; margin: 5px 0;">${new Date(order.order_date).toLocaleDateString()}</p>
                        <p>Items: ${order.items.map(i => i.name).join(', ')}</p>
                        <p>Total: <strong>$${order.total_amount}</strong></p>
                        <button class="review-btn" onclick="openReview(${order.id})">Leave a Review</button>
                    </div>
                    <div class="barcode">
                        ${order.id.toString().padStart(8, '0')}
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error(err);
        }
    }
};

let currentRating = 5;
function setRating(r) {
    currentRating = r;
    const stars = document.querySelectorAll('.stars span');
    stars.forEach((s, i) => {
        s.style.color = i < r ? 'var(--accent)' : '#ccc';
    });
}

function openReview(orderId) {
    document.getElementById('review-modal').style.display = 'grid';
}

function closeReview() {
    document.getElementById('review-modal').style.display = 'none';
}

async function submitReview() {
    const comment = document.getElementById('review-comment').value;
    const user = JSON.parse(localStorage.getItem('currentUser'));

    try {
        const res = await fetch('../backend/reviews.php?action=add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                username: user.username,
                rating: currentRating,
                comment: comment
            })
        });
        const result = await res.json();
        if (result.status === 'success') {
            alert('Your review has been shared with the community!');
            closeReview();
        }
    } catch (err) {
        console.error(err);
    }
}

cartManager.init();
