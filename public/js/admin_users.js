const table = document.getElementById("users-table");

async function ensureAdminOrRedirect() {
  try {
    const res = await fetch("api.php?controller=auth&action=me");
    const data = await res.json();
    const currentUser = data.user || null;
    if (!currentUser || currentUser.role !== "admin") {
      alert("Access denied");
      window.location.href = "login.html";
      return false;
    }
    return true;
  } catch (err) {
    console.error(err);
    window.location.href = "login.html";
    return false;
  }
}

function loadUsers() {
  fetch("api.php?controller=users&action=list")
    .then((res) => res.json())
    .then((data) => {
      const users = data.users || [];
      table.innerHTML = "";
      users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.role}</td>
          <td>
            ${
              user.role === "admin"
                ? "—"
                : `<button class="delete-btn" onclick="deleteUser('${user.id}')" >Delete</button>`
            }
          </td>
        `;
        table.appendChild(row);
      });
    });
}

window.deleteUser = (function (id) {
  if (!confirm("Delete this user?")) return;

  fetch(`api.php?controller=users&action=delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        loadUsers();
      } else {
        alert("Error: " + data.error);
      }
    });
})(
  // run after verifying admin session
  async () => {
    if (await ensureAdminOrRedirect()) loadUsers();
  }
)();
