"use strict";

const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  alert("Please login first");
  window.location.href = "login.html";
}

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmt = (n) =>
    Number(n).toLocaleString(undefined, { style: "currency", currency: "USD" });

  const STORAGE = { CART: "coffeeShop.cart" };
  let catalog = [];
  let cart = JSON.parse(localStorage.getItem(STORAGE.CART)) || [];
  let checkoutPendingItems = [];

  const modal = $("#checkout-modal");
  const modalTotal = $("#modal-total");
  const receiptModal = $("#receipt-modal");

  window.closeModal = () => {
    modal.classList.add("hidden");
    checkoutPendingItems = [];
  };

  window.closeReceipt = () => {
    receiptModal.classList.add("hidden");
  };

  function updateCartBadge() {
    const badge = document.getElementById("cart-count");
    if (!badge) return;
    const userCart = cart.filter(i => i.user === currentUser.username);
    badge.textContent = userCart.length;
  }

  function openCheckout(items, total) {
    checkoutPendingItems = items;
    if (modalTotal) modalTotal.textContent = fmt(total);
    modal.classList.remove("hidden");
  }

  function showReceipt(order) {
    const details = $("#receipt-details");
    const barcodeImg = $("#receipt-barcode");
    const date = new Date().toLocaleString();
    const orderId = Math.floor(Math.random() * 100000);
    
    if (barcodeImg) {
        barcodeImg.src = `https://bwipjs-api.metafloor.com/?bcid=code128&text=ABY-${orderId}&scale=2&height=10&includetext`;
    }

    details.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Date:</span> <span>${date}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Customer:</span> <span>${currentUser.username}</span>
      </div>
      <div class="receipt-divider"></div>
      <div style="margin: 15px 0;">
        <table style="width:100%; text-align: left; border-collapse: collapse;">
          ${order.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td style="text-align: right;">${fmt(item.price)}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      <div class="receipt-divider"></div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem; margin-top: 10px;">
        <span>TOTAL:</span> <span>${fmt(order.total)}</span>
      </div>
    `;
    
    receiptModal.classList.remove("hidden");
  }

  $("#confirm-purchase-btn")?.addEventListener("click", async () => {
    const address = $("#ship-address").value.trim();
    const card = $("#card-num").value.trim();

    if (!address || !card) {
      alert("Please enter delivery and payment info!");
      return;
    }

    const totalAmount = checkoutPendingItems.reduce((sum, i) => sum + Number(i.price), 0);
    
    const order = {
      user_id: currentUser.id,
      username: currentUser.username,
      items: checkoutPendingItems,
      total: totalAmount,
      source: checkoutPendingItems.length > 1 ? "CART" : "BUY_NOW"
    };

    try {
      const res = await fetch("../backend/orders.php?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
      const data = await res.json();
      
      if (data.success) {
        showReceipt(order);
        if (order.source === "CART") {
          cart = cart.filter(i => i.user !== currentUser.username);
          localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
        }
        closeModal();
        renderCart();
        renderTransactions();
        updateCartBadge();
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Connection failed");
    }
  });

  const productsGrid = $("#products-grid");

  async function init() {
    try {
      const res = await fetch("../backend/products.php?action=list");
      const data = await res.json();
      catalog = data.products || [];
      renderCatalog();
      renderCart();
      renderTransactions();
      updateCartBadge();
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }

  function renderCatalog() {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";
    catalog.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      
      // Fixed image pathing logic
      let imgPath = item.image_url;
      // If it's just the filename, prepend img/
      if (!imgPath.includes('/')) {
        imgPath = 'img/' + imgPath;
      }

      card.innerHTML = `
        <div class="thumb"><img src="${imgPath}" alt="${item.name}" onerror="this.src='img/coffeelogo.png'" /></div>
        <div class="card-content">
            <div class="title">${item.name}</div>
            <div class="desc">${item.description || ''}</div>
            <div class="price">${fmt(item.price)}</div>
            <div class="actions">
              <button class="btn primary" data-buy="${item.id}">Buy Now</button>
              <button class="btn secondary" data-add="${item.id}">Add Cart</button>
            </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }

  function renderCart() {
    const cartContainer = $("#cart-items");
    const cartEmpty = $("#cart-empty");
    const checkoutBtn = $("#checkout-btn");
    const cartSummary = $("#cart-summary");

    if (!cartContainer) return;
    const userCart = cart.filter((i) => i.user === currentUser.username);
    cartContainer.innerHTML = "";

    if (userCart.length === 0) {
      cartEmpty.style.display = "block";
      if (checkoutBtn) checkoutBtn.disabled = true;
      if (cartSummary) cartSummary.classList.add("hidden");
      updateCartBadge();
      return;
    }

    cartEmpty.style.display = "none";
    if (checkoutBtn) checkoutBtn.disabled = false;
    if (cartSummary) cartSummary.classList.remove("hidden");

    userCart.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.style = "display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;";
      div.innerHTML = `
        <span>${item.name} - ${fmt(item.price)}</span>
        <button class="btn delete-btn" data-remove="${index}" style="background:none; color:red; padding:0; flex:0;">✕</button>
      `;
      cartContainer.appendChild(div);
    });

    const subtotal = userCart.reduce((sum, i) => sum + Number(i.price), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    if ($("#cart-subtotal")) $("#cart-subtotal").innerText = fmt(subtotal);
    if ($("#cart-tax")) $("#cart-tax").innerText = fmt(tax);
    if ($("#cart-total")) $("#cart-total").innerText = fmt(total);
    updateCartBadge();
  }

  productsGrid?.addEventListener("click", (e) => {
    const buyId = e.target.dataset.buy;
    const addId = e.target.dataset.add;
    if (!buyId && !addId) return;

    const product = catalog.find(p => p.id == (buyId || addId));
    if (buyId) {
      openCheckout([product], product.price);
    } else {
      cart.push({ ...product, user: currentUser.username });
      localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
      renderCart();
    }
  });

  $("#cart-items")?.addEventListener("click", (e) => {
    const removeIdx = e.target.dataset.remove;
    if (removeIdx === undefined) return;
    const userCartItems = cart.filter(i => i.user === currentUser.username);
    const itemToRemove = userCartItems[removeIdx];
    const absoluteIdx = cart.indexOf(itemToRemove);
    if (absoluteIdx > -1) {
      cart.splice(absoluteIdx, 1);
      localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
      renderCart();
    }
  });

  $("#checkout-btn")?.addEventListener("click", () => {
    const userCart = cart.filter(i => i.user === currentUser.username);
    const subtotal = userCart.reduce((sum, i) => sum + Number(i.price), 0);
    openCheckout(userCart, subtotal * 1.1);
  });

  function renderTransactions() {
    const container = $("#transactions-list");
    if (!container) return;
    fetch("../backend/orders.php?action=user_orders&user_id=" + currentUser.id)
      .then((res) => res.json())
      .then((data) => {
        const userOrders = data.orders || [];
        container.innerHTML = "";
        if (userOrders.length === 0) {
          container.innerHTML = "<p>No orders yet.</p>";
          return;
        }
        userOrders.forEach((order) => {
          const div = document.createElement("div");
          div.style = "background:white; padding:15px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05); margin-bottom:15px;";
          div.innerHTML = `
            <div style="font-weight:bold;">Order #${order.id} - ${order.order_date}</div>
            <div style="color:#666; font-size:0.9rem;">${order.items.map(i => i.product_name).join(", ")}</div>
            <div style="color:green; font-weight:bold;">Total: ${fmt(order.total_amount)}</div>
          `;
          container.appendChild(div);
        });
      });
  }

  init();
})();
