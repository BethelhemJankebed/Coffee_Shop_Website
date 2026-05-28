"use strict";

(function () {
  const nav = document.querySelector("header .nav-links");
  if (!nav) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
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

  const finalLinks = links.concat(authLinks);
  nav.innerHTML = finalLinks
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
      // call backend logout, then clear client state
      fetch("api.php?controller=auth&action=logout", {
        method: "POST",
      }).finally(() => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
      });
    });
  }
})();
