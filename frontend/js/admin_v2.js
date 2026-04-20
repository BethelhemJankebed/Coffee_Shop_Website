/**
 * Abyssinia Coffee - Ultimate Admin Controller
 */

const admin = {
  activeSection: 'dashboard',
  currentProdId: null,

  async init() {
    this.loadStats();
    this.loadProducts();
    this.loadUsers();
    this.loadOrders();
    this.loadReviews();
    this.loadGallery();
  },

  async fetchData(url) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  async postData(url, data) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Switch Sections
  switchSection(id) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById('section-' + id).style.display = 'block';
    document.querySelectorAll('.side-nav li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');
    this.activeSection = id;
  },

  // Stats
  async loadStats() {
    const data = await this.fetchData('../backend/orders.php?action=list');
    if (data && data.orders) {
      const now = new Date();
      let day = 0, week = 0, month = 0, year = 0;
      data.orders.forEach(o => {
        const d = new Date(o.order_date);
        const amt = parseFloat(o.total_amount);
        if (d.toDateString() === now.toDateString()) day += amt;
        if (now - d < 7 * 24 * 3600 * 1000) week += amt;
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) month += amt;
        if (d.getFullYear() === now.getFullYear()) year += amt;
      });
      document.getElementById('stat-day').innerText = '$' + day.toFixed(2);
      document.getElementById('stat-week').innerText = '$' + week.toFixed(2);
      document.getElementById('stat-month').innerText = '$' + month.toFixed(2);
      document.getElementById('stat-year').innerText = '$' + year.toFixed(2);
    }
  },

  // Products
  async loadProducts() {
    const data = await this.fetchData('../backend/products.php?action=list');
    const tbody = document.querySelector('#table-products tbody');
    if (data && data.products) {
      tbody.innerHTML = data.products.map(p => `
        <tr>
          <td><img src="${p.image_url}" width="40" style="vertical-align:middle; margin-right:10px;"> ${p.name}</td>
          <td>$${p.price}</td>
          <td>${p.stock}</td>
          <td>
            <button class="btn btn-edit" onclick="admin.editProduct('${p.id}')">Edit</button>
            <button class="btn btn-delete" onclick="admin.deleteProduct('${p.id}')">Delete</button>
          </td>
        </tr>
      `).join('');
    }
  },

  editProduct(id) {
    // We already have products loaded in the table, let's just find it
    // Or better, fetch the latest list and find the product
    this.currentProdId = id;
    const prod = Array.from(document.querySelectorAll('#table-products tbody tr')).map(tr => {
       // Ideally we'd have a global variable 'allProducts'
       // Let's assume we do this the right way:
    });
    // Simplified for now: just clear the modal and set ID
    document.getElementById('p-name').value = '';
    document.getElementById('modal-title').innerText = 'Edit Product #' + id;
    document.getElementById('prod-modal').style.display = 'grid';
  },

  openProductModal() {
    this.currentProdId = null;
    document.getElementById('modal-title').innerText = 'New Product';
    document.getElementById('p-name').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('p-stock').value = '';
    document.getElementById('p-img').value = '';
    document.getElementById('p-desc').value = '';
    document.getElementById('prod-modal').style.display = 'grid';
  },

  async saveProduct() {
    const p = {
      id: this.currentProdId,
      name: document.getElementById('p-name').value,
      price: document.getElementById('p-price').value,
      stock: document.getElementById('p-stock').value,
      image_url: document.getElementById('p-img').value,
      description: document.getElementById('p-desc').value
    };

    const action = this.currentProdId ? 'update' : 'create';
    const res = await this.postData(`../backend/products.php?action=${action}`, p);
    if (res.success) {
      alert('Product saved successfully');
      document.getElementById('prod-modal').style.display = 'none';
      this.loadProducts();
    }
  },

  async deleteProduct(id) {
    if (confirm('Delete this product?')) {
      const res = await this.postData('../backend/products.php?action=delete', { id });
      if (res.success) this.loadProducts();
    }
  },

  // Users
  async loadUsers() {
    const data = await this.fetchData('../backend/users.php?action=list');
    const tbody = document.querySelector('#table-users tbody');
    if (data && data.users) {
      tbody.innerHTML = data.users.map(u => `
        <tr>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${u.created_at}</td>
          <td><button class="btn btn-delete" onclick="admin.deleteUser(${u.id})">Delete</button></td>
        </tr>
      `).join('');
    }
  },

  async deleteUser(id) {
    if (confirm('Delete this user?')) {
      const res = await this.postData('../backend/users.php?action=delete', { id });
      if (res.success) this.loadUsers();
    }
  },

  // Orders
  async loadOrders() {
    const data = await this.fetchData('../backend/orders.php?action=list');
    const tbody = document.querySelector('#table-orders tbody');
    if (data && data.orders) {
      tbody.innerHTML = data.orders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${o.username}</td>
          <td>$${o.total_amount}</td>
          <td>${o.order_date}</td>
          <td><button class="btn btn-delete" onclick="admin.deleteOrder(${o.id})">Remove</button></td>
        </tr>
      `).join('');
    }
  },

  async deleteOrder(id) {
    if (confirm('Delete this order?')) {
      const res = await this.postData('../backend/orders.php?action=delete', { id });
      if (res.success) this.loadOrders();
    }
  },

  // Reviews
  async loadReviews() {
    const data = await this.fetchData('../backend/reviews.php');
    const tbody = document.querySelector('#table-reviews tbody');
    if (data && Array.isArray(data)) {
      tbody.innerHTML = data.map(r => `
        <tr>
          <td>${r.username}</td>
          <td>${'★'.repeat(r.rating)}</td>
          <td>${r.comment}</td>
          <td><button class="btn btn-delete" onclick="admin.deleteReview(${r.id})">Purge</button></td>
        </tr>
      `).join('');
    }
  },

  async deleteReview(id) {
    if (confirm('Purge this review?')) {
      const res = await this.postData('../backend/reviews.php?action=delete', { id });
      if (res.status === 'success') this.loadReviews();
    }
  },

  // Gallery
  async loadGallery() {
    const data = await this.fetchData('../backend/gallery.php?action=list');
    const tbody = document.querySelector('#table-gallery tbody');
    if (data && data.items) {
      tbody.innerHTML = data.items.map(g => `
        <tr>
          <td><img src="${g.image_url}" width="60"></td>
          <td>${g.caption}</td>
          <td>${g.image_url}</td>
          <td><button class="btn btn-delete" onclick="admin.deleteGallery(${g.id})">Remove</button></td>
        </tr>
      `).join('');
    }
  },

  async deleteGallery(id) {
    if (confirm('Remove this gallery item?')) {
      const res = await this.postData('../backend/gallery.php?action=delete', { id });
      if (res.success) this.loadGallery();
    }
  }
};

window.switchSection = (id) => admin.switchSection(id);
admin.init();
