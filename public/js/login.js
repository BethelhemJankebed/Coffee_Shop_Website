async function performLogin() {
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;
  const errorMsg = document.getElementById("error");

  // Clear any previous error messages
  errorMsg.innerText = "";

  try {
    const res = await fetch("api.php?controller=auth&action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });

    const data = await res.json();

    if (data.success) {
      // Cache a minimal, non-sensitive user object for faster UI (server is authoritative)
      const cachedUser = {
        id: data.user.id,
        username: data.user.username,
        role: data.user.role,
        initials: data.user.initials,
      };
      localStorage.setItem("currentUser", JSON.stringify(cachedUser));

      // Redirect based on role
      if (cachedUser.role === "admin") {
        window.location.href = "Admin.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      errorMsg.innerHTML =
        (data.error || "Invalid credentials") +
        ". <a href='signup.html' style='color:#f39c12;'>Sign up here</a>";
    }
  } catch (err) {
    console.error("Login Error:", err);
    errorMsg.innerText = "Error connecting to backend.";
  }
}
