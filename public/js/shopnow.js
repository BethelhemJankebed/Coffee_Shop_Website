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

  let catalog = [];

  const productsGrid = $("#products-grid");

  async function init() {
    try {
      const res = await fetch("api.php?controller=products&action=list");
      const data = await res.json();
      catalog = data.products || [];
      renderCatalog();
    } catch (err) {
      console.error("Failed to load products", err);
    }
  }

  function renderCatalog() {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";
    catalog.forEach((item) => {
      const isOutOfStock = item.stock !== undefined && item.stock <= 0;
      const card = document.createElement("div");
      card.className = "card";

      let imgPath = item.image_url;
      if (!imgPath.includes("/")) {
        imgPath = "img/" + imgPath;
      }

      card.innerHTML = `
        <div class="thumb" style="position:relative">
            <img src="${imgPath}" alt="${
        item.name
      }" onerror="this.src='img/coffeelogo.png'" />
            ${
              isOutOfStock
                ? '<div style="position:absolute; inset:0; background:rgba(255,255,255,0.7); display:grid; place-items:center; color:red; font-weight:bold; font-size:1.5rem;">OUT OF STOCK</div>'
                : ""
            }
        </div>
        <div class="card-content">
            <div class="title">${item.name}</div>
            <div class="desc">${item.description || ""}</div>
            <div class="price">${fmt(item.price)}</div>
            <div class="actions">
              ${
                isOutOfStock
                  ? '<button class="btn primary" disabled style="background:#ccc">Sold Out</button>'
                  : `<button class="btn primary" onclick="buyNow('${item.id}', '${item.name}', ${item.price}, '${imgPath}')">Buy Now</button>
                 <button class="btn secondary" onclick="addToCart('${item.id}', '${item.name}', ${item.price}, '${imgPath}')">Add Cart</button>`
              }
            </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  }

  window.addToCart = (id, name, price, image) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ id, name, price, image });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} has been added to your order list.`);
  };

  window.buyNow = (id, name, price, image) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ id, name, price, image });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "cart.html";
  };

  init();
})();
