"use strict";

(function () {
  const nav = document.querySelector("header .nav-links");
  if (!nav) return;

  const page = (
    window.location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();

  const links = [
    { href: "index.html", label: "HOME", key: "index.html" },
    { href: "shopnow.html", label: "SHOP", key: "shopnow.html" },
    { href: "reserve.html", label: "RESERVE", key: "reserve.html" },
    { href: "gallery.html", label: "GALLERY", key: "gallery.html" },
    { href: "cart.html", label: "CART", key: "cart.html" },
  ];

  function render(currentUser) {
    const authLinks = currentUser
      ? [
          {
            href: "#",
            label: `LOGOUT (${String(
              currentUser.username || "USER"
            ).toUpperCase()})`,
            action: "logout",
            className: "auth-link",
          },
        ]
      : [
          {
            href: "login.html",
            label: "SIGN IN",
            key: "login.html",
            className: "auth-link",
          },
          {
            href: "signup.html",
            label: "SIGN UP",
            key: "signup.html",
            className: "auth-link",
          },
        ];

    if (currentUser && currentUser.role === "admin") {
      authLinks.push({ href: "Admin.html", label: "ADMIN", key: "admin.html" });
    }

    nav.innerHTML = links
      .concat(authLinks)
      .map((link) => {
        const isActive = link.key && link.key === page;
        const style = isActive ? ' style="color: var(--accent)"' : "";
        return `<a href="${link.href}"${style}${
          link.className ? ` class="${link.className}"` : ""
        }${link.action ? ` data-action="${link.action}"` : ""}>${link.label}</a>`;
      })
      .join("");

    const logoutLink = nav.querySelector('a[data-action="logout"]');
    if (logoutLink) {
      logoutLink.addEventListener("click", function (event) {
        event.preventDefault();
        fetch("api.php?controller=auth&action=logout", {
          method: "POST",
        }).finally(() => {
          localStorage.removeItem("currentUser");
          window.location.href = "login.html";
        });
      });
    }
  }

  // Render immediately from cached data so the navbar never stays blank.
  let cachedUser = null;
  try {
    cachedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch (err) {
    cachedUser = null;
  }
  render(cachedUser);

  // Refresh from server session in the background and re-render if needed.
  fetch("api.php?controller=auth&action=me")
    .then((res) => res.json())
    .then((data) => {
      const serverUser = data.user || null;
      if (serverUser) {
        localStorage.setItem("currentUser", JSON.stringify(serverUser));
      } else {
        localStorage.removeItem("currentUser");
      }
      render(serverUser);
    })
    .catch((err) => {
      console.error("Could not fetch session user", err);
    });

})();
