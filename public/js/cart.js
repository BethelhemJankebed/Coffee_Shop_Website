/**
 * Abyssinia Coffee - Boutique Portfolio Controller (Cart & History)
 * Features: Checkout, History Tracking, Review System.
 */

const cartManager = {
  user: null,
  items: JSON.parse(localStorage.getItem("cart")) || [],

  async init() {
    // Fetch authoritative session user from server
    try {
      const res = await fetch("api.php?controller=auth&action=me");
      const d = await res.json();
      this.user = d.user || null;
    } catch (err) {
      console.error("Could not fetch session user", err);
    }
    if (!this.user) {
      window.location.href = "login.html";
      return;
    }
    // Pre-fill name from logged-in user (from session)
    const nameEl = document.getElementById("co-name");
    if (nameEl && this.user.username) nameEl.value = this.user.username;
    this.renderCart();
    this.loadHistory();
  },

  renderCart() {
    const container = document.getElementById("cart-items");
    const summary = document.getElementById("checkout-summary");

    if (this.items.length === 0) {
      container.innerHTML =
        '<p style="text-align:center; padding: 40px; color: #666;">Your portfolio is currently empty. Explore our collection in the shop.</p>';
      summary.style.display = "none";
      return;
    }

    summary.style.display = "block";
    container.innerHTML = this.items
      .map(
        (item, index) => `
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
        `
      )
      .join("");

    const total = this.items.reduce(
      (sum, item) => sum + parseFloat(item.price),
      0
    );
    document.getElementById("total-price").innerText = `$${total.toFixed(2)}`;
  },

  removeItem(index) {
    this.items.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(this.items));
    this.renderCart();
  },

  async checkout() {
    const deliveryName = document.getElementById("co-name")?.value.trim();
    const deliveryPhone = document.getElementById("co-phone")?.value.trim();
    const deliveryAddress = document.getElementById("co-address")?.value.trim();

    if (!deliveryPhone || !deliveryAddress) {
      UI.popup(
        "Missing Info",
        "Please enter your phone number and delivery address.",
        "⚠️"
      );
      return;
    }

    // Close the modal
    document.getElementById("checkout-modal").style.display = "none";

    const total = this.items.reduce(
      (sum, item) => sum + parseFloat(item.price),
      0
    );

    const orderData = {
      items: this.items,
      total: total,
      source: "BOUTIQUE_WEB",
      delivery_name: deliveryName,
      delivery_phone: deliveryPhone,
      delivery_address: deliveryAddress,
    };

    try {
      const response = await fetch("api.php?controller=orders&action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      if (result.success) {
        this.showReceipt(orderData);
        localStorage.removeItem("cart");
        this.items = [];
      } else {
        UI.popup(
          "Transaction Error",
          result.error || "Could not place order.",
          "❌"
        );
      }
    } catch (err) {
      console.error(err);
      UI.popup(
        "Connection Error",
        "Could not reach the server. Please try again.",
        "❌"
      );
    }
  },

  showReceipt(order) {
    document.getElementById("receipt-details").innerHTML = `
            <p><strong>Customer:</strong> ${
              order.delivery_name || order.username
            }</p>
            <p><strong>Phone:</strong> ${order.delivery_phone || "—"}</p>
            <p><strong>Delivery To:</strong> ${
              order.delivery_address || "—"
            }</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <hr>
            ${order.items.map((i) => `<p>${i.name} — $${i.price}</p>`).join("")}
            <hr>
            <p style="font-size:1.1rem;"><strong>Total: $${order.total.toFixed(
              2
            )}</strong></p>
        `;
    document.getElementById("receipt-barcode").innerText =
      "ORD" +
      Math.floor(Math.random() * 9999999)
        .toString()
        .padStart(7, "0");
    document.getElementById("receipt-modal").style.display = "grid";
  },

  async loadHistory() {
    try {
      // let the backend use the server session to identify the user
      const response = await fetch(
        `api.php?controller=orders&action=user_orders`
      );
      const data = await response.json();

      const container = document.getElementById("order-history");
      if (!data.orders || data.orders.length === 0) {
        container.innerHTML = "<p>No past transactions found.</p>";
        return;
      }

      container.innerHTML = data.orders
        .map(
          (order) => `
                <div class="history-card">
                    <div>
                        <h3 style="margin:0">Order #${order.id}</h3>
                        <p style="color:#666; margin: 5px 0;">${new Date(
                          order.order_date
                        ).toLocaleDateString()}</p>
                        <p>Items: ${order.items
                          .map((i) => i.name)
                          .join(", ")}</p>
                        <p>Total: <strong>$${order.total_amount}</strong></p>
                        <button class="review-btn" onclick="openReview(${
                          order.id
                        })">Leave a Review</button>
                    </div>
                    <div class="barcode">
                        ${order.id.toString().padStart(8, "0")}
                    </div>
                </div>
            `
        )
        .join("");
    } catch (err) {
      console.error(err);
    }
  },
};

let currentRating = 5;
function setRating(r) {
  currentRating = r;
  const stars = document.querySelectorAll(".stars span");
  stars.forEach((s, i) => {
    s.style.color = i < r ? "var(--accent)" : "#ccc";
  });
}

function openReview(orderId) {
  document.getElementById("review-modal").style.display = "grid";
}

function closeReview() {
  document.getElementById("review-modal").style.display = "none";
}

async function submitReview() {
  const comment = document.getElementById("review-comment").value.trim();

  if (!comment) {
    UI.popup("Empty Review", "Please write something before submitting.", "✏️");
    return;
  }

  try {
    // send only review data; backend will prefer server session for user identity
    const res = await fetch("api.php?controller=reviews&action=add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: currentRating,
        comment: comment,
      }),
    });
    const result = await res.json();
    if (result.status === "success") {
      closeReview();
      document.getElementById("review-comment").value = "";
      UI.popup(
        "Thank You!",
        "Your review has been shared with the Abyssinia community.",
        "⭐"
      );
    } else {
      UI.popup(
        "Error",
        result.message || "Could not submit review. Please try again.",
        "❌"
      );
    }
  } catch (err) {
    console.error(err);
    UI.popup("Connection Error", "Could not reach the server.", "❌");
  }
}

cartManager.init();

function openCheckoutModal() {
  if (!cartManager.items || cartManager.items.length === 0) {
    UI.popup(
      "Cart Empty",
      "Please add items to your cart before checking out.",
      "🛒"
    );
    return;
  }
  document.getElementById("checkout-modal").style.display = "grid";
}
