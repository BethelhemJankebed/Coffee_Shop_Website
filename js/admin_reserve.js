//admin_reserve js
   currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
    throw new Error("Access denied"); 
  }
    const tableBody = document.getElementById("reservations-table");
    const refreshBtn = document.querySelector(".refresh-btn");

    function loadReservations() {
      fetch("http://localhost:4000/reservations")
 // we will create this endpoint in backend
        .then(res => res.json())
        .then(data => {
          tableBody.innerHTML = ""; // clear table
          data.forEach(reservation => {
  const row = document.createElement("tr");
  row.innerHTML = `
  <td>${reservation.id}</td>
  <td>${reservation.full_name}</td>
  <td>${reservation.phone}</td>
  <td>${reservation.reservation_date}</td>
  <td>${reservation.reservation_time}</td>
  <td>${reservation.guests}</td>
  <td>
    <button class="delete-btn" onclick="deleteReservation('${reservation.id}')"
>
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

    refreshBtn.addEventListener("click", loadReservations);


function deleteReservation(id) {
  if (!confirm("Are you sure you want to delete this reservation?")) return;

 fetch(`http://localhost:4000/reservations/${id}`, {
    method: "DELETE"
  })
  .then(res => res.text())
.then(() => {
  loadReservations(); 
})

  .catch(err => {
    console.error(err);
    alert("Error deleting reservation");
  });
}

    // Load reservations when page opens
    loadReservations();
