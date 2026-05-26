//admin_order js
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
  alert("Access denied");
  window.location.href = "login.html";
}

const table = document.getElementById("orders-table");

function loadOrders() {
  fetch("api.php?controller=orders&action=list")
    .then(res => res.json())
    .then(data => {
      const orders = data.orders || [];
      table.innerHTML = "";
      orders.forEach((order, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${order.id}</td>
          <td style="font-weight:bold;">${order.delivery_name || order.username}</td>
          <td>${order.delivery_phone || '—'}</td>
          <td>${order.delivery_address || '—'}</td>
          <td>${order.items.map(i => i.product_name || i.name).join(", ")}</td>
          <td style="color:green; font-weight:bold;">$${Number(order.total_amount).toFixed(2)}</td>
          <td>${order.order_date}</td>
          <td><button class="delete-btn" onclick="deleteOrder('${order.id}')">Delete</button></td>
        `;
        table.appendChild(row);
      });
    });
}

window.deleteOrder = function(id) {
  if (!confirm("Delete this order?")) return;
  fetch(`api.php?controller=orders&action=delete`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      loadOrders();
    } else {
      alert("Error: " + data.error);
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error deleting order");
  });
}

loadOrders();
