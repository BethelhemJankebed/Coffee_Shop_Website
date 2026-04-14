//admin_reserve js
   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
    throw new Error("Access denied"); 
  }
    const tableBody = document.getElementById("reservations-table");
    const refreshBtn = document.querySelector(".refresh-btn");

    function loadReservations() {
      fetch("../../backend/reservations.php?action=list")
        .then(res => res.json())
        .then(data => {
          const reservations = data.reservations || [];
          tableBody.innerHTML = ""; 
          reservations.forEach(reservation => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${reservation.id}</td>
              <td>${reservation.full_name}</td>
              <td>${reservation.phone}</td>
              <td>${reservation.reservation_date}</td>
              <td>${reservation.reservation_time}</td>
              <td>${reservation.guests}</td>
              <td>
                <button class="delete-btn" onclick="deleteReservation('${reservation.id}')">
                  Delete
                </button>
              </td>
            `;
            tableBody.appendChild(row);
          });
        })
        .catch(err => {
          console.error(err);
          alert("Error loading reservations");
        });
    }

    refreshBtn?.addEventListener("click", loadReservations);

window.deleteReservation = function(id) {
  if (!confirm("Are you sure you want to delete this reservation?")) return;

  fetch(`../../backend/reservations.php?action=delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      loadReservations(); 
    } else {
      alert("Error: " + data.error);
    }
  })
  .catch(err => {
    console.error(err);
    alert("Error deleting reservation");
  });
}

    // Load reservations when page opens
    loadReservations();
