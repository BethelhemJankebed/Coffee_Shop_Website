async function performLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const errorMsg = document.getElementById('error');
    
    // Clear any previous error messages
    errorMsg.innerText = "";

    try {
        const res = await fetch('../backend/auth.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
        });
        
        const data = await res.json();
        
        if (data.success) {
            // Store session
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            // Redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = 'Admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            errorMsg.innerHTML = 
                (data.error || "Invalid credentials") + ". <a href='signup.html' style='color:#f39c12;'>Sign up here</a>";
        }
    } catch (err) {
        console.error("Login Error:", err);
        errorMsg.innerText = "Error connecting to backend.";
    }
}