
 currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
  }

 table = document.getElementById("users-table");

  function loadUsers() {
    fetch("http://localhost:4000/users")
      .then(res => res.json())
      .then(users => {
        table.innerHTML = "";
        users.forEach(user => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
              ${user.role === "admin" 
                ? "—" 
                : `<button class="delete-btn" onclick="deleteUser('${user.id}')" >Delete</button>`}
            </td>
          `;
          table.appendChild(row);
        });
      });
  }

  function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  fetch(`http://localhost:4000/users/${id}`, {
    method: "DELETE"
  })
  .then(() => loadUsers());
}


  loadUsers();