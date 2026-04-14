// Protection: Only admins allowed
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}

const table = document.getElementById("gallery-table");

function loadGalleryItems() {
    fetch("../backend/gallery.php?action=list")
        .then(res => res.json())
        .then(data => {
            const items = data.items || [];
            table.innerHTML = "";
            items.forEach(item => {
                const url = item.image_url || item.url;
                const title = item.caption || item.title || "";
                
                const isVideo = url.includes("data:video");
                const isAudio = url.includes("data:audio");
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${isVideo ? 'ðŸŽ¥ Video' : isAudio ? 'ðŸŽµ Audio' : `<img src="${url}" class="preview-img" style="width:50px;height:50px;object-fit:cover;">`}</td>
                    <td>${title}</td>
                    <td>${isVideo ? 'Video' : isAudio ? 'Audio' : 'Image'}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteGalleryItem('${item.id}')">Delete Post</button>
                    </td>
                `;
                table.appendChild(row);
            });
        });
}

window.deleteGalleryItem = function(id) {
    if (!confirm("Remove this post from the public gallery?")) return;

    fetch(`../backend/gallery.php?action=delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadGalleryItems();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Error deleting gallery item");
    });
}

loadGalleryItems();
