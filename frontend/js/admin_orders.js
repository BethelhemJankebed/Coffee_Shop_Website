//admin_order js
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
  alert("Access denied");
  window.location.href = "login.html";
}

const table = document.getElementById("orders-table");
const ordersCount = document.getElementById("orders-count");
const ordersRevenue = document.getElementById("orders-revenue");
const latestOrder = document.getElementById("latest-order");
const uniqueCustomers = document.getElementById("unique-customers");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderText(value, fallback = "—") {
  const text = value && String(value).trim() ? String(value).trim() : fallback;
  return escapeHtml(text);
}

function renderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "—";
  }

  const labels = items.map((i) => i.product_name || i.name || "Item");
  return (
    labels.slice(0, 3).join(", ") +
    (labels.length > 3 ? ` +${labels.length - 3} more` : "")
  );
}

function renderDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return escapeHtml(value);
  return date.toLocaleString();
}

function renderCustomer(order) {
  const name = renderText(order.delivery_name || order.username || "Guest");
  const source = order.username ? escapeHtml(order.username) : "Guest";
  return `<span class="cell-strong">${name}</span><span class="subtle">Account: ${source}</span>`;
}

function renderPhone(order) {
  const phone = renderText(order.delivery_phone, "—");
  return `<span class="cell-strong">${phone}</span>`;
}

function renderAddress(order) {
  const address = renderText(order.delivery_address, "—");
  return `<span class="cell-strong">${address}</span>`;
}

function renderMoney(order) {
  const amount = Number(order.total_amount ?? order.total ?? 0);
  return `<span class="amount">$${amount.toFixed(2)}</span>`;
}

function loadOrders() {
  fetch("../backend/orders.php?action=list")
    .then((res) => res.json())
    .then((data) => {
      const orders = data.orders || [];
      if (ordersCount) {
        ordersCount.textContent = orders.length.toString();
      }

      if (ordersRevenue) {
        const totalRevenue = orders.reduce(
          (sum, order) => sum + Number(order.total_amount || order.total || 0),
          0
        );
        ordersRevenue.textContent = `$${totalRevenue.toFixed(2)}`;
      }

      if (latestOrder) {
        latestOrder.textContent = orders[0] ? `#${orders[0].id}` : "—";
      }

      if (uniqueCustomers) {
        const customers = new Set(
          orders
            .map((order) => order.delivery_name || order.username)
            .filter(Boolean)
        );
        uniqueCustomers.textContent = customers.size.toString();
      }

      table.innerHTML = "";

      if (orders.length === 0) {
        table.innerHTML = `
          <tr>
            <td colspan="8">
              <div class="empty-state">No customer orders found yet.</div>
            </td>
          </tr>
        `;
        return;
      }

      orders.forEach((order, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><span class="cell-strong">#${escapeHtml(order.id)}</span></td>
          <td>${renderCustomer(order)}</td>
          <td>${renderPhone(order)}</td>
          <td>${renderAddress(order)}</td>
          <td class="items-list">${renderItems(order.items)}</td>
          <td>${renderMoney(order)}</td>
          <td class="order-date">${renderDate(
            order.order_date || order.date
          )}</td>
          <td><button class="action-btn" onclick="deleteOrder('${escapeHtml(
            order.id
          )}')">Delete</button></td>
        `;
        table.appendChild(row);
      });
    });
}

window.deleteOrder = function (id) {
  if (!confirm("Delete this order?")) return;
  fetch(`../backend/orders.php?action=delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        loadOrders();
      } else {
        alert("Error: " + data.error);
      }
    })
    .catch((err) => {
      console.error(err);
      alert("Error deleting order");
    });
};

loadOrders();
