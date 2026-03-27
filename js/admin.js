// admin js
// Admin protection
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
  alert("Access denied");
  window.location.href = "login.html";
}

// Load counts
fetch("../backend/users.php?action=list")
  .then(res => res.json())
  .then(data => {
    const count = data.users ? data.users.length : 0;
    const el = document.getElementById("userCount");
    if (el) el.innerText = count;
  });

fetch("../backend/reservations.php?action=list")
  .then(res => res.json())
  .then(data => {
    const count = data.reservations ? data.reservations.length : 0;
    const el = document.getElementById("reservationCount");
    if (el) el.innerText = count;
  });

window.logout = function() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}



