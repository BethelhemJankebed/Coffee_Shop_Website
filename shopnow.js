"use strict";

// 🔐 LOGIN CHECK
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser) {
  alert("Please login first");
  window.location.href = "login.html";
}

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmt = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  const STORAGE = { CART: "coffeeShop.cart" };
  let catalog = [];
  let cart = JSON.parse(localStorage.getItem(STORAGE.CART)) || [];
function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const userCart = cart.filter(i => i.user === currentUser.username);
  badge.textContent = userCart.length;
}
function buyNow(product) {
  const order = {
    username: currentUser.username,
    items: [product],
    total: product.price,
    date: new Date().toLocaleString(),
    source: "BUY_NOW"   
  };

  fetch("http://localhost:4000/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  })
    .then(() => {
      alert("✅ Purchased!");
      renderTransactions();
    })
    .catch(err => {
      console.error(err);
      alert("❌ Failed to send order");
    });
}

  const productsGrid = $("#products-grid");

  // 🔹 LOAD PRODUCTS
  async function init() {
    try {
      const res = await fetch("db.json");
      const data = await res.json();
      catalog = data.products;
renderCatalog();
renderCart();
renderTransactions();
updateCartBadge(); // ✅ ADD THIS

    } catch (err) {
      console.error("Failed to load products", err);
    }
  }

  // 🔹 RENDER PRODUCTS
  function renderCatalog() {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";
    catalog.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="thumb"><img src="${item.image}" alt="${item.name}" /></div>
        <div class="title">${item.name}</div>
        <div class="desc">${item.desc}</div>
        <div class="price">${fmt(item.price)}</div>
        <div class="actions">
          <button class="btn primary" data-buy="${item.id}">Buy Now</button>
          <button class="btn secondary" data-add="${item.id}">Add to Cart</button>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }

  // 🔹 RENDER CART
  function renderCart() {
    const cartContainer = document.getElementById("cart-items");
    const cartEmpty = document.getElementById("cart-empty");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (!cartContainer) return;
 
    const userCart = cart.filter((i) => i.user === currentUser.username);
    cartContainer.innerHTML = "";

   if (userCart.length === 0) {
  cartEmpty.style.display = "block";
  checkoutBtn.disabled = true;
  updateCartBadge(); 
  return;
}


    cartEmpty.style.display = "none";
    checkoutBtn.disabled = false;

    userCart.forEach((item) => {
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <span>${item.name}</span> - <strong>${fmt(item.price)}</strong>
        <button class="btn delete-btn" data-remove="${item.id}">Remove</button>
      `;
      cartContainer.appendChild(div);
    });

    const subtotal = userCart.reduce((sum, i) => sum + i.price, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    document.getElementById("cart-subtotal").innerText = fmt(subtotal);
    document.getElementById("cart-tax").innerText = fmt(tax);
    document.getElementById("cart-total").innerText = fmt(total);

    document.getElementById("cart-summary").classList.remove("hidden");
  updateCartBadge();
}
  // 🔹 CART CLICK EVENTS
  productsGrid?.addEventListener("click", (e) => {
    const buyId = e.target.dataset.buy;
    const addId = e.target.dataset.add;

    if (buyId || addId) {
  const product = catalog.find(p => p.id == (buyId || addId));

  if (buyId) {
    // ✅ BUY NOW → DIRECT TO DB
    buyNow(product);
  } else {
    // ✅ ADD TO CART
    const item = { ...product, user: currentUser.username };
    cart.push(item);
    localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
    alert(`${item.name} added to cart`);
    renderCart();
  }
}

  });

  // 🔹 REMOVE ITEM FROM CART
  document.getElementById("cart-items")?.addEventListener("click", (e) => {
    const removeId = e.target.dataset.remove;
    if (!removeId) return;

    cart = cart.filter(
      (i) => !(i.id === removeId && i.user === currentUser.username)
    );
    localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
    renderCart();
  });

  // 🔹 CHECKOUT
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  const userCart = cart.filter((i) => i.user === currentUser.username);
  if (userCart.length === 0) return alert("Your cart is empty");

  const order = {
    username: currentUser.username,
    items: userCart, // <-- use userCart instead of 'items'
    total: userCart.reduce((sum, i) => sum + i.price, 0),
    date: new Date().toLocaleString()
  };

  fetch("http://localhost:4000/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  })
    .then(() => {
      alert("✅ Order placed successfully!");
      // Remove purchased items from cart
      cart = cart.filter((i) => i.user !== currentUser.username);
      localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
      renderCart();
      renderTransactions();
    })
    .catch((err) => console.error(err));
});


  // 🔹 RENDER USER TRANSACTIONS
  function renderTransactions() {
    const container = document.getElementById("transactions-list");
    if (!container) return;

    fetch("http://localhost:4000/orders")
      .then((res) => res.json())
      .then((orders) => {
        const userOrders = orders.filter(
          (o) => o.username === currentUser.username
        );
        container.innerHTML = "";

        if (userOrders.length === 0) {
          container.innerHTML = "<p>No transactions yet.</p>";
          return;
        }

        userOrders.forEach((order) => {
          const div = document.createElement("div");
          div.className = "transaction";
          div.innerHTML = `
            <strong>Date:</strong> ${order.date}<br/>
            <strong>Total:</strong> ${fmt(order.total)}<br/>
            <strong>Items:</strong> ${order.items
              .map((i) => i.name)
              .join(", ")}
          `;
          container.appendChild(div);
        });
      });
  }

  init();
})();
