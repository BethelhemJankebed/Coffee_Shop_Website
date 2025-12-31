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
                // 1️⃣ Check if username already exists
                const res = await fetch("http://localhost:4000/users");
                const users = await res.json();

                if (users.find(u => u.username === user)) {
                    msg.style.color = "#ff6b6b";
                    msg.innerText = "Username already exists!";
                    return;
                }

                // 2️⃣ Add new user
                await fetch("http://localhost:4000/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user, password: pass, role: "user" })
                });

                msg.style.color = "#2ecc71";
                msg.innerText = "Account created! Redirecting to login...";
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);

            } catch (err) {
                console.error(err);
                msg.style.color = "#ff6b6b";
                msg.innerText = "Error creating account. Please try again.";
            }
        }