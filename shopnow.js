"use strict";

(function () {
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => n.toLocaleString('am-ET', { style: "currency", currency: "ETB" });

  const STORAGE = {
    CART: "coffeeShop.cart",
    TXNS: "coffeeShop.transactions"
  };

  let catalog = [];
  let cart = JSON.parse(localStorage.getItem(STORAGE.CART)) || [];
  let transactions = JSON.parse(localStorage.getItem(STORAGE.TXNS)) || [];

  // --- INITIALIZATION ---
  async function init() {
    try {
      const response = await fetch('db.json');
      const data = await response.json();
      catalog = data.products || [];
      renderCatalog();
      updateUI();
    } catch (err) {
      console.error("Failed to load catalog data", err);
    }
    setupEventListeners();
  }

  // --- RENDERERS ---
  function renderCatalog() {
    const productsGrid = $("products-grid");
    if (!productsGrid) return;

    productsGrid.innerHTML = catalog.map(item => `
            <div class="card reveal">
                <div class="thumb">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='img/Coffeehero.jpg'">
                </div>
                <div class="card-details">
                    <span class="title">${item.name}</span>
                    <p class="desc">${item.desc}</p>
                    <div class="card-footer">
                        <span class="price">${fmt(item.price)}</span>
                        <div class="actions">
                            <button class="btn-add" data-add="${item.id}">Add to Cart</button>
                            <button class="btn-buy" data-buy="${item.id}">Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
  }

  function updateUI() {
    renderCart();
    renderTransactions();

    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    const countEl = $("cart-count");
    if (countEl) countEl.innerText = count;

    const checkoutBtn = $("checkout-btn");
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;

    localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
    localStorage.setItem(STORAGE.TXNS, JSON.stringify(transactions));
  }

  function renderCart() {
    const cartItemsEl = $("cart-items");
    const emptyEl = $("cart-empty");
    const summaryEl = $("cart-summary");
    if (!cartItemsEl) return;

    if (cart.length === 0) {
      cartItemsEl.innerHTML = "";
      emptyEl?.classList.remove("hidden");
      summaryEl?.classList.add("hidden");
      return;
    }

    emptyEl?.classList.add("hidden");
    summaryEl?.classList.remove("hidden");

    cartItemsEl.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <div class="name">${item.name}</div>
                    <div class="unit">${fmt(item.price)} each</div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-qty-dec="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" data-qty-inc="${item.id}">+</button>
                </div>
            </div>
        `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    if ($("cart-subtotal")) $("cart-subtotal").innerText = fmt(subtotal);
    if ($("cart-tax")) $("cart-tax").innerText = fmt(tax);
    if ($("cart-total")) $("cart-total").innerText = fmt(total);
  }

  function renderTransactions() {
    const listEl = $("transactions-list");
    if (!listEl) return;

    if (transactions.length === 0) {
      listEl.innerHTML = `<p class="muted" style="text-align:center; padding: 20px;">No recent orders</p>`;
      return;
    }

    listEl.innerHTML = transactions.slice(-5).reverse().map(txn => `
            <div class="txn">
                <div class="txn-header">
                    <span>${new Date(txn.date).toLocaleDateString()}</span>
                    <span>${fmt(txn.total)}</span>
                </div>
                <div class="txn-items">${txn.items.join(', ')}</div>
            </div>
        `).join('');
  }

  // --- ACTIONS ---
  function addToCart(id) {
    const product = catalog.find(p => p.id == id);
    if (!product) return;

    const existing = cart.find(item => item.id == id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    updateUI();
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id == id);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id != id);
    }
    updateUI();
  }

  function setupEventListeners() {
    // Product Grid clicks
    $("products-grid")?.addEventListener("click", e => {
      const addId = e.target.dataset.add;
      const buyId = e.target.dataset.buy;

      if (addId) addToCart(addId);
      if (buyId) {
        addToCart(buyId);
        window.location.hash = "cart";
      }
    });

    // Cart Actions
    $("cart-items")?.addEventListener("click", e => {
      const incId = e.target.dataset.qtyInc;
      const decId = e.target.dataset.qtyDec;
      if (incId) changeQty(incId, 1);
      if (decId) changeQty(decId, -1);
    });

    // Checkout logic
    $("checkout-btn")?.addEventListener("click", () => {
      if (cart.length === 0) return;

      // Ensure user is logged in
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert("Please login to complete your order.");
        window.location.href = 'login.html';
        return;
      }

      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0) * 1.1;
      const newTxn = {
        date: new Date().toISOString(),
        total: total,
        items: cart.map(i => `${i.qty}x ${i.name}`)
      };

      transactions.push(newTxn);
      cart = [];
      updateUI();

      showSuccessModal();
    });

    $("clear-transactions")?.addEventListener("click", () => {
      if (confirm("Clear your order history?")) {
        transactions = [];
        updateUI();
      }
    });

    // Modal Close
    document.addEventListener("click", e => {
      if (e.target.hasAttribute("data-close")) {
        $("modal").classList.add("hidden");
      }
    });
  }

  function showSuccessModal() {
    const modal = $("modal");
    const modalBody = $("modal-body");
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #4ade80; margin-bottom: 20px; display: block;"></i>
                <h2 style="font-family: 'Playfair Display', serif; margin-bottom: 15px;">Order Placed Successfully!</h2>
                <p style="color: #888;">Your coffee is being prepared and will be delivered shortly. Thank you for choosing Abyssinia!</p>
            </div>
        `;

    modal.classList.remove("hidden");
  }

  init();
})();
