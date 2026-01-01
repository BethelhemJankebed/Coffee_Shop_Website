async function performLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    const errorMsg = document.getElementById('error');
    
    // Clear any previous error messages
    errorMsg.innerText = "";

    try {
        // 1. Fetch from the server on port 4000
        const res = await fetch('http://localhost:4000/users');
        
        if (!res.ok) {
            throw new Error("Server not responding");
        }

        const users = await res.json();
        
        // 2. Find the user in the array returned by the server
        const foundUser = users.find(
            user => user.username === u && user.password === p
        );

        if (foundUser) {
            // Store session
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            
            // 3. Redirect based on role
            if (foundUser.role === 'admin') {
                window.location.href = 'Admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            errorMsg.innerHTML = 
                "Invalid credentials. <a href='signup.html' style='color:#f39c12;'>Sign up here</a>";
        }
    } catch (err) {
        console.error("Login Error:", err);
        errorMsg.innerText = "Error: Make sure json-server is running on port 4000.";
    }
}