import { baseURL } from "./config.js";
document.addEventListener("DOMContentLoaded", () => {
  (async () => {
    try {
      const res = await fetch(`${baseURL}/api/auth/check-auth`, {
        credentials: "include",
      });

      const loginLink = document.getElementById("login-link");
      const logoutLink = document.getElementById("logout-link");

      if (res.ok) {
        loginLink.style.display = "none";
        logoutLink.style.display = "inline-block";
      } else {
        loginLink.style.display = "inline-block";
        logoutLink.style.display = "none";

        const current = window.location.pathname;
        if (current.includes("favourites") || current.includes("cart")) {
          localStorage.setItem("redirectAfterLogin", current.split("/").pop());
          localStorage.setItem("loginReason", "yetkiGerekli");
          window.location.href = "login.html";
        }
      }
    } catch {
      console.log("Check-auth hatası");
    }
  })();

  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");

  logoutLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch(`${baseURL}/api/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    window.location.href = "logout.html";
  });

  //  Ürün Kartı Tıklama
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".buy-btn") || e.target.closest(".fav-btn")) return;

      const productId = this.getAttribute("data-id");
      if (productId === "tekli") {
        window.location.href = "product-single.html";
      } else if (productId === "12li") {
        window.location.href = "product-box.html";
      }
    });
  });

  //  Sepete Ekle
  document.querySelectorAll(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productCard = this.closest(".product-card");

      const product = {
        productId: productCard.getAttribute("data-id"),
        name: productCard.querySelector("h3").textContent,
        price: parseFloat(
          productCard
            .querySelector(".price")
            ?.textContent.replace("₺", "")
            .replace(",", ".")
        ),
        quantity: 1,
        image:
          productCard.querySelector("img")?.getAttribute("src") ||
          "/images/default.png",
      };
      console.log("📦 Sepete eklenen ürün:", product);

      fetch(`${baseURL}/api/auth/check-auth`, {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Giriş gerekli");
          return fetch(`${baseURL}/api/cart`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ product }),
          });
        })
        .then(() => showToast("Ürün başarıyla sepete eklendi."))
        .catch(() => {
          const localCart = JSON.parse(localStorage.getItem("cart")) || [];
          localCart.push(product);
          localStorage.setItem("cart", JSON.stringify(localCart));
          showToast("Giriş yapmadan önce sepetinize eklendi 🧺");
        });
    });
  });

  //  Favoriler Linki
  const favoritesLink = document.getElementById("favorites-link");
  favoritesLink?.addEventListener("click", () => {
    fetch(`${baseURL}/api/auth/check-auth`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          window.location.href = "/favourites.html";
        } else {
          localStorage.setItem("redirectAfterLogin", "favourites.html");
          localStorage.setItem("loginReason", "favoritesAccess");
          window.location.href = "login.html";
        }
      })
      .catch(() => {
        localStorage.setItem("redirectAfterLogin", "favourites.html");
        localStorage.setItem("loginReason", "favoritesAccess");
        window.location.href = "login.html";
      });
  });

  //  Sepet Linki
  const cartLink = document.getElementById("cart-link");
  cartLink?.addEventListener("click", () => {
    fetch(`${baseURL}/api/auth/check-auth`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          window.location.href = "cart.html";
        } else {
          const localCart = JSON.parse(localStorage.getItem("cart")) || [];
          if (localCart.length > 0) {
            localStorage.setItem("redirectAfterLogin", "cart.html");
            localStorage.setItem("loginReason", "cartAccess");
            window.location.href = "login.html";
          } else {
            window.location.href = "cart.html";
          }
        }
      })
      .catch(() => {
        window.location.href = "login.html";
      });
  });

  loginLink?.addEventListener("click", () => {
    window.location.href = "login.html";
  });

  //  Arama Öneri Sistemi
  const searchInput = document.getElementById("search-input");
  const suggestionsBox = document.getElementById("suggestions");

  const products = [
    {
      id: "tekli",
      name: "Chovora Tekli Bar",
      image: "/images/packet.png",
      link: "product-single.html",
    },
    {
      id: "12li",
      name: "Chovora Tanışma Paketi (12'li)",
      image: "/images/chovora-box.jpg",
      link: "product-box.html",
    },
  ];

  searchInput?.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";

    if (!q) return;

    const results = products.filter((p) => p.name.toLowerCase().includes(q));
    results.forEach((product) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.innerHTML = `<img src="${product.image}" alt="${product.name}" /><span>${product.name}</span>`;
      item.addEventListener("click", () => {
        window.location.href = product.link;
      });
      suggestionsBox.appendChild(item);
    });
  });

  document
    .querySelector(".search-bar button")
    ?.addEventListener("click", () => {
      const q = searchInput.value.trim();
      if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    });

  searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }
    }
  });
});

// toast Bildirimi
export function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  const index = container.querySelectorAll(".toast").length;
  toast.style.top = `${index * 60}px`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add("hide"), 3000);
  setTimeout(() => toast.remove(), 3500);
}

//  Favorilere Ekle
function addToFavorites(productId) {
  if (!productId) return;

  fetch(`${baseURL}/api/favourites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productId }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Favori eklenemedi");
      showToast("Ürün favorilere eklendi 💛");
    })
    .catch(() => {
      showToast("Favori eklemek için giriş yapmalısınız.");
      localStorage.setItem("redirectAfterLogin", "index.html");
      localStorage.setItem("loginReason", "favoritesAccess");
      window.location.href = "login.html";
    });
}

document.querySelectorAll(".fav-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const productId = this.closest(".product-card").getAttribute("data-id");
    addToFavorites(productId);
  });
});

window.addToFavorites = addToFavorites;
