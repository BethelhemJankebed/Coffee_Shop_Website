// Protection: Only admins allowed
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied");
    window.location.href = "login.html";
}

const table = document.getElementById("gallery-table");

function loadGalleryItems() {
    fetch("http://localhost:4000/gallery")
        .then(res => res.json())
        .then(items => {
            table.innerHTML = "";
            items.reverse().forEach(item => {
                const isVideo = item.url.includes("data:video");
                const isAudio = item.url.includes("data:audio");
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${isVideo ? '🎥 Video' : isAudio ? '🎵 Audio' : `<img src="${item.url}" class="preview-img">`}</td>
                    <td>${item.title}</td>
                    <td>${isVideo ? 'Video' : isAudio ? 'Audio' : 'Image'}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteGalleryItem('${item.id}')">Delete Post</button>
                    </td>
                `;
                table.appendChild(row);
            });
        });
}

function deleteGalleryItem(id) {
    if (!confirm("Remove this post from the public gallery?")) return;

    fetch(`http://localhost:4000/gallery/${id}`, {
        method: "DELETE"
    })
    .then(() => loadGalleryItems());
}

loadGalleryItems();