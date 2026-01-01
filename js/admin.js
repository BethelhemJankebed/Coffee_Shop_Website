<<<<<<< HEAD

=======
//admin js
 // Admin protection
>>>>>>> d4f5f58ca68e38134cacb19caa9ea0188ff03c38
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
  }

<<<<<<< HEAD
=======
  // Load counts
>>>>>>> d4f5f58ca68e38134cacb19caa9ea0188ff03c38
  fetch("http://localhost:4000/users")
    .then(res => res.json())
    .then(data => {
      document.getElementById("userCount").innerText = data.length;
    });

  fetch("http://localhost:4000/reservations")
    .then(res => res.json())
    .then(data => {
      document.getElementById("reservationCount").innerText = data.length;
    });

  function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }



