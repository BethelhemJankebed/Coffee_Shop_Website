const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
  alert("Access denied");
  window.location.href = "login.html";
}

const table = document.getElementById("users-table");

function loadUsers() {
  fetch("../../backend/users.php?action=list")
    .then(res => res.json())
    .then(data => {
      const users = data.users || [];
      table.innerHTML = "";
      users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.role}</td>
          <td>
            ${user.role === "admin" 
              ? "â€”" 
              : `<button class="delete-btn" onclick="deleteUser('${user.id}')" >Delete</button>`}
          </td>
        `;
        table.appendChild(row);
      });
    });
}

window.deleteUser = function(id) {
  if (!confirm("Delete this user?")) return;

  fetch(`../../backend/users.php?action=delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      loadUsers();
    } else {
      alert("Error: " + data.error);
    }
  });
}

loadUsers();
