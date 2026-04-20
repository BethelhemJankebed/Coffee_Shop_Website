  const form = document.querySelector(".reserve-form");
  const MAX_SEATS = 10;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const full_name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const reservation_date = document.getElementById("date").value;
    const reservation_time = document.getElementById("time").value;
    const guests = Number(document.getElementById("guests").value);

    // 1ï¸âƒ£ GET existing reservations to check capacity
    fetch("../backend/reservations.php?action=list")
      .then(res => res.json())
      .then(data => {
        const reservations = data.reservations || [];

        // 2ï¸âƒ£ Filter same date & time
        const sameSlot = reservations.filter(r =>
          r.reservation_date === reservation_date &&
          r.reservation_time === reservation_time
        );

        // 3ï¸âƒ£ Count reserved seats
        let reservedSeats = 0;
        sameSlot.forEach(r => {
          reservedSeats += Number(r.guests);
        });

        // 4ï¸âƒ£ Check capacity
        if (reservedSeats + guests > MAX_SEATS) {
          alert("âŒ Sorry, all seats are reserved for this time.");
          return;
        }

        // 5ï¸âƒ£ POST reservation
        const reserveData = {
          full_name,
          phone,
          reservation_date,
          reservation_time,
          guests
        };

        return fetch("../backend/reservations.php?action=create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(reserveData)
        });
      })
     .then(response => {
        if (!response) return; 
        return response.json();
      })
      .then(result => {
        if (result && result.success) {
          alert("âœ… Reservation successful! See you soon at Abyssinia Coffee.");
          form.reset();
        } else if (result && result.error) {
          alert("âŒ " + result.error);
        }
      })
      .catch(err => {
        console.error(err);
        alert("âŒ Error saving reservation. Please try again.");
      });
  });


