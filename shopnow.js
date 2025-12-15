"use strict";

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const fmt = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });
  const STORAGE = {
    CART: "coffeeShop.cart",
    TXNS: "coffeeShop.transactions",
  };

  const catalog = [
    {
      id: "espresso",
      name: "Espresso",
      price: 3.0,
      desc: "Rich single shot",
      image: "./img/esspresso.png",
    },
    {
      id: "americano",
      name: "Americano",
      price: 3.5,
      desc: "Espresso + hot water",
      image: "./img/moca.png",
    },
    {
      id: "latte",
      name: "Latte",
      price: 4.5,
      desc: "Espresso + steamed milk",
      image: "./img/c1.jpg",
    },
    {
      id: "cappuccino",
      name: "Cappuccino",
      price: 4.5,
      desc: "Espresso + foam",
      image: "./img/c2.jpg",
    },
    {
      id: "mocha",
      name: "Mocha",
      price: 5.0,
      desc: "Chocolate + espresso",
      image: "./img/c3.jpg",
    },
    {
      id: "macchiato",
      name: "Macchiato",
      price: 4.0,
      desc: "Espresso marked with foam",
      image: "./img/c4.jpg",
    },
    {
      id: "croissant",
      name: "Butter Croissant",
      price: 3.25,
      desc: "Flaky, buttery pastry",
      image: "./img/butter.jpg",
    },
    {
      id: "muffin",
      name: "Chocolate Muffin",
      price: 3.0,
      desc: "Freshly baked daily",
      image: "./img/cupcake.jpg",
    },
  ];

  let cart = load(STORAGE.CART, []);
  let txns = load(STORAGE.TXNS, []);

  const productsGrid = $("#products-grid");
  const cartCount = $("#cart-count");
  const cartEmpty = $("#cart-empty");
  const cartList = $("#cart-items");
  const cartSummary = $("#cart-summary");
  const cartSubtotal = $("#cart-subtotal");
  const cartTax = $("#cart-tax");
  const cartTotal = $("#cart-total");
  const checkoutBtn = $("#checkout-btn");

  const modal = $("#modal");
  const modalBody = $("#modal-body");
  const modalActions = $("#modal-actions");
  const modalTitle = $("#modal-title");

  renderCatalog();
  renderCart();
  renderTransactions();
  updateCartBadge();
  attachGlobalHandlers();

  function load(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }
  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function renderCatalog() {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";
    catalog.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      const imgSrc = item.image || "img/placeholder.png";
      card.innerHTML = `
        <div class="thumb">${
          imgSrc
            ? `<img src="${imgSrc}" alt="${escapeHTML(item.name)}" />`
            : '<div class="thumb placeholder">Image coming soon</div>'
        }</div>
        <div class="title">${item.name}</div>
        <div class="desc">${item.desc}</div>
        <div class="price">${fmt(item.price)}</div>
        <div class="actions">
          <button class="btn primary" data-buy="${item.id}">Buy</button>
          <button class="btn secondary" data-add="${
            item.id
          }">Add to Cart</button>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    productsGrid.addEventListener("click", (e) => {
      const buyId = e.target.closest("[data-buy]")?.dataset.buy;
      const addId = e.target.closest("[data-add]")?.dataset.add;
      if (buyId) onBuyNow(buyId);
      if (addId) onAddToCart(addId);
    });
  }

  function onAddToCart(id) {
    const item = catalog.find((p) => p.id === id);
    if (!item) return;
    const existing = cart.find((ci) => ci.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name: item.name, price: item.price, qty: 1 });
    save(STORAGE.CART, cart);
    renderCart();
    updateCartBadge();
  }

  function onBuyNow(id) {
    const item = catalog.find((p) => p.id === id);
    if (!item) return;
    openQtyModal(item);
  }

  function openQtyModal(item) {
    modalTitle.textContent = `Buy ${item.name}`;
    modalBody.innerHTML = `
      <label class="label" for="qty-input">Enter quantity</label>
      <input id="qty-input" type="number" min="1" step="1" value="1" class="input" />
    `;
    modalActions.innerHTML = `
      <button class="btn ghost" data-close>Cancel</button>
      <button class="btn primary" id="qty-confirm">Continue</button>
    `;
    showModal();
    $("#qty-input").focus();

    $("#qty-confirm").onclick = () => {
      const qty = Math.max(1, parseInt($("#qty-input").value || "1", 10));
      showReceipt([{ name: item.name, unitPrice: item.price, qty }]);
    };
  }

  function showReceipt(lines) {
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    modalTitle.textContent = "Confirm Purchase";
    modalBody.innerHTML = `
      <div>
        ${lines
          .map(
            (l) =>
              `<div>${escapeHTML(l.name)} × ${l.qty} — <strong>${fmt(
                l.unitPrice * l.qty
              )}</strong></div>`
          )
          .join("")}
      </div>
      <div style="margin-top:10px; border-top:1px solid #5a4336; padding-top:10px; display:grid; gap:6px">
        <div><span>Subtotal</span> — <strong>${fmt(subtotal)}</strong></div>
        <div><span>Tax (10%)</span> — <strong>${fmt(tax)}</strong></div>
        <div style="font-weight:800; font-size:18px"><span>Total</span> — <strong>${fmt(
          total
        )}</strong></div>
      </div>
    `;
    modalActions.innerHTML = `
      <button class="btn ghost" data-close>Cancel</button>
      <button class="btn primary" id="receipt-confirm">Confirm Purchase</button>
    `;
    showModal();

    $("#receipt-confirm").onclick = () => {
      const txn = buildTxnFromLines(lines);
      txns.unshift(txn);
      save(STORAGE.TXNS, txns);
      renderTransactions();
      hideModal();
      toast("Purchase confirmed");
    };
  }

  function buildTxnFromLines(lines) {
    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return {
      id: "txn_" + Date.now(),
      ts: Date.now(),
      items: lines.map((l) => ({
        name: l.name,
        unitPrice: l.unitPrice,
        qty: l.qty,
        subtotal: l.unitPrice * l.qty,
      })),
      subtotal,
      tax,
      total,
    };
  }

  function renderCart() {
    if (!cartList) return;
    cartList.innerHTML = "";
    if (!cart.length) {
      cartEmpty.classList.remove("hidden");
      cartSummary.classList.add("hidden");
      checkoutBtn.disabled = true;
      return;
    }
    cartEmpty.classList.add("hidden");
    checkoutBtn.disabled = false;

    let subtotal = 0;

    cart.forEach((ci) => {
      subtotal += ci.price * ci.qty;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div>
          <div class="name">${escapeHTML(ci.name)}</div>
          <div class="unit">${fmt(ci.price)} each</div>
        </div>
        <div class="qty-controls" data-id="${ci.id}">
          <button class="btn qty-btn" data-dec>-</button>
          <span>${ci.qty}</span>
          <button class="btn qty-btn" data-inc>+</button>
        </div>
        <div class="line-total">${fmt(ci.price * ci.qty)}</div>
        <div><button class="btn ghost" data-remove>Remove</button></div>
      `;
      cartList.appendChild(row);
    });

    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    cartSummary.classList.remove("hidden");
    cartSubtotal.textContent = fmt(subtotal);
    cartTax.textContent = fmt(tax);
    cartTotal.textContent = fmt(total);

    cartList.onclick = (e) => {
      const host = e.target.closest(".qty-controls, .cart-item");
      if (!host) return;
      const id =
        host.querySelector("[data-id]")?.dataset.id ||
        host.querySelector(".qty-controls")?.dataset.id;
      if (!id) return;
      if (e.target.matches("[data-inc]")) changeQty(id, +1);
      if (e.target.matches("[data-dec]")) changeQty(id, -1);
      if (e.target.matches("[data-remove]")) removeFromCart(id);
    };
  }

  function changeQty(id, delta) {
    const idx = cart.findIndex((ci) => ci.id === id);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    save(STORAGE.CART, cart);
    renderCart();
    updateCartBadge();
  }

  function removeFromCart(id) {
    const idx = cart.findIndex((ci) => ci.id === id);
    if (idx === -1) return;
    cart.splice(idx, 1);
    save(STORAGE.CART, cart);
    renderCart();
    updateCartBadge();
  }

  checkoutBtn?.addEventListener("click", () => {
    if (!cart.length) return;
    const lines = cart.map((ci) => ({
      name: ci.name,
      unitPrice: ci.price,
      qty: ci.qty,
    }));
    showReceipt(lines);
    const confirmBtnObserver = new MutationObserver(() => {
      const btn = $("#receipt-confirm");
      if (btn) {
        btn.addEventListener("click", onConfirmedCart, { once: true });
        confirmBtnObserver.disconnect();
      }
    });
    confirmBtnObserver.observe(document.body, {
      subtree: true,
      childList: true,
    });

    function onConfirmedCart() {
      cart = [];
      save(STORAGE.CART, cart);
      renderCart();
      updateCartBadge();
    }
  });

  function renderTransactions() {
    const host = $("#transactions-list");
    if (!host) return;
    host.innerHTML = "";
    if (!txns.length) {
      const d = document.createElement("div");
      d.className = "muted";
      d.textContent = "No transactions yet.";
      host.appendChild(d);
      return;
    }
    txns.forEach((t) => {
      const div = document.createElement("div");
      div.className = "txn";
      const date = new Date(t.ts).toLocaleString();
      const itemsText = t.items.map((i) => `${i.name} × ${i.qty}`).join(", ");
      div.innerHTML = `
        <div class="txn-header">
          <div><strong>${date}</strong></div>
          <div><strong>${fmt(t.total)}</strong></div>
        </div>
        <div class="txn-items">${escapeHTML(itemsText)}</div>
      `;
      host.appendChild(div);
    });
  }

  function updateCartBadge() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    if (cartCount) cartCount.textContent = String(count);
  }

  function attachGlobalHandlers() {
    modal.addEventListener("click", (e) => {
      if (
        e.target.hasAttribute("data-close") ||
        e.target === $(".modal-backdrop", modal)
      ) {
        hideModal();
      }
    });
  }

  function showModal() {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }
  function hideModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.textContent = msg;
    t.style.position = "fixed";
    t.style.right = "16px";
    t.style.bottom = "16px";
    t.style.background = "#2b1f18";
    t.style.border = "1px solid #6b513f";
    t.style.borderRadius = "10px";
    t.style.padding = "10px 12px";
    t.style.color = "#e6c9ad";
    t.style.boxShadow = "0 8px 20px rgba(0,0,0,.35)";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1600);
  }

  function escapeHTML(s) {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  }
})();
