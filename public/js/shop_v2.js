"use strict";

(async function () {
  let currentUser = null;

  const productsGrid = document.getElementById("products-grid");

  async function init() {
    const sessionPromise = fetch("api.php?controller=auth&action=me")
      .then((res) => res.json())
      .then((d) => {
        currentUser = d.user || null;
        return currentUser;
      })
      .catch((err) => {
        console.error("Could not fetch session user", err);
        return null;
      });

    const productsPromise = fetch("api.php?controller=products&action=list")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          renderProducts(data.products);
        }
      })
      .catch((err) => {
        console.error(err);
      });

    await sessionPromise;
    if (!currentUser) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    try {
      await productsPromise;
    } catch (err) {
      console.error(err);
    }

    // Auth Sync for Nav (use serverUser cached in this closure)
    if (currentUser) {
      const nav = document.getElementById("main-nav");
      const logout = document.createElement("a");
      logout.href = "#";
      logout.innerHTML = `LOGOUT (${currentUser.username})`;
      logout.onclick = () => {
        fetch("api.php?controller=auth&action=logout", {
          method: "POST",
        }).finally(() => {
          localStorage.clear();
          location.reload();
        });
      };
      nav.appendChild(logout);
      if (currentUser.role === "admin") {
        const adminL = document.createElement("a");
        adminL.href = "Admin.html";
        adminL.innerText = "ADMIN";
        adminL.style.color = "var(--accent)";
        nav.appendChild(adminL);
      }
    }
  }

  function renderProducts(catalog) {
    if (!productsGrid) return;
    productsGrid.innerHTML = catalog
      .map((p) => {
        const isOutOfStock = p.stock !== undefined && p.stock <= 0;
        let imgPath = p.image_url;
        if (!imgPath.includes("/")) imgPath = "img/" + imgPath;

        return `
        <div class="product-card">
          <img src="${imgPath}" class="product-img" onerror="this.src='img/coffeelogo.png'">
          <div class="product-info">
            ${isOutOfStock ? '<div class="stock-badge">OUT OF STOCK</div>' : ""}
            <h3>${p.name}</h3>
            <p class="price">$${p.price}</p>
            <div class="btn-group">
              ${
                isOutOfStock
                  ? '<button class="btn-boutique" disabled style="background:#ccc">Sold Out</button>'
                  : `<button class="btn-boutique accent" onclick="buyNow('${p.id}', '${p.name}', ${p.price}, '${imgPath}')">Buy Now</button>
                 <button class="btn-boutique" onclick="addToCart('${p.id}', '${p.name}', ${p.price}, '${imgPath}')">Add Cart</button>`
              }
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  }

  window.addToCart = (id, name, price, image) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ id, name, price, image });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to your portfolio.`);
  };

  window.buyNow = (id, name, price, image) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ id, name, price, image });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "cart.html";
  };

  init();
})();
