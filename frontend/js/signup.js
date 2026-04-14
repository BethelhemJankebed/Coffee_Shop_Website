 async function handleSignUp() {
    const user = document.getElementById('new-user').value.trim();
    const pass = document.getElementById('new-pass').value.trim();
    const msg = document.getElementById('msg');

    if (!user || !pass) {
        msg.style.color = "#ff6b6b";
        msg.innerText = "Please fill in all fields.";
        return;
    }

    try {
        const res = await fetch("../backend/auth.php?action=signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        const data = await res.json();

        if (data.success) {
            msg.style.color = "#2ecc71";
            msg.innerText = "Account created! Redirecting to login...";
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        } else {
            msg.style.color = "#ff6b6b";
            msg.innerText = data.error || "Error creating account.";
        }
    } catch (err) {
        console.error(err);
        msg.style.color = "#ff6b6b";
        msg.innerText = "Error connecting to backend.";
    }
}
