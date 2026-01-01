//admin_order js
currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
  }

  const table = document.getElementById("orders-table");

  function loadOrders() {
    fetch("http://localhost:4000/orders")
      .then(res => res.json())
      .then(orders => {
        table.innerHTML = "";
        orders.forEach((order, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${order.username}</td>
            <td>${order.items.map(i => i.name).join(", ")}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${order.date}</td>
           <td><button class="delete-btn" onclick="deleteOrder('${order.id}')">Delete</button></td>


          `;
          table.appendChild(row);
        });
      });
  }

function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;
    fetch(`http://localhost:4000/orders/${id}`, { method: "DELETE" })
        .then(() => loadOrders());
}


  loadOrders();