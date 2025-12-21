"use strict";

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const fmt = (n) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });
  
  const STORAGE = { CART: "coffeeShop.cart", TXNS: "coffeeShop.transactions" };

  let catalog = []; 
  let cart = JSON.parse(localStorage.getItem(STORAGE.CART)) || [];
  const productsGrid = $("#products-grid");

  // --- API FETCH: Pulls data from your JSON file ---
  async function init() {
    try {
      // Adjusted path to match your folder structure
      const response = await fetch('db.json'); 
      const data = await response.json();
      catalog = data.products; 
      renderCatalog();
    } catch (err) {
      console.error("Failed to load API data", err);
    }
  }

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

  productsGrid?.addEventListener("click", (e) => {
    const id = e.target.dataset.buy || e.target.dataset.add;
    if (id) {
       const item = catalog.find(p => p.id === id);
       alert(`Added ${item.name} to cart!`);
    }
  });

  init();
})();
