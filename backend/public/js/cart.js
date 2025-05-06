import { baseURL } from "./config.js";
import {
  showToast,
  updateLoginUI,
  getLoginState,
  setLoginState,
} from "./script.js";

// Giriş kontrolü
async function checkAuth() {
  try {
    const res = await fetch(`${baseURL}/api/auth/check-auth`, {
      credentials: "include",
    });
    setLoginState(res.ok); // ✅ Login state'i doğru şekilde ayarla
  } catch (err) {
    console.warn("check-auth error:", err);
    setLoginState(false);
  }
}

// Favorilere ekleme
function addToFavorites(productId) {
  if (!productId) return;

  if (!getLoginState()) {
    showToast("Favorilere eklemek için giriş yapmalısınız.");
    return;
  }

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
      showToast("Favori eklenemedi.");
    });
}

window.addToFavorites = addToFavorites;

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth(); // ✅ Giriş durumu belirlenir
  updateLoginUI(); // ✅ Navbar login/logout güncellenir

  // Çıkış
  document
    .getElementById("logout-link")
    ?.addEventListener("click", async (e) => {
      e.preventDefault();
      await fetch(`${baseURL}/api/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      window.location.href = "logout.html";
    });

  // Ürün detayına yönlendirme
  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".buy-btn") || e.target.closest(".fav-btn")) return;
      const id = this.getAttribute("data-id");
      window.location.href =
        id === "tekli" ? "product-single.html" : "product-box.html";
    });
  });

  // Sepete ekleme
  document.querySelectorAll(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const product = {
        productId: card.getAttribute("data-id"),
        name: card.querySelector("h3").textContent,
        price: parseFloat(
          card
            .querySelector(".price")
            .textContent.replace("₺", "")
            .replace(",", ".")
        ),
        quantity: 1,
        image:
          card.querySelector("img")?.getAttribute("src") ||
          "/images/default.png",
      };

      if (getLoginState()) {
        fetch(`${baseURL}/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ product }),
        })
          .then(() => showToast("Ürün başarıyla sepete eklendi."))
          .catch(() => showToast("Sunucu hatası."));
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        localCart.push(product);
        localStorage.setItem("cart", JSON.stringify(localCart));
        showToast("Giriş yapmadan önce sepetinize eklendi 🧸");
      }
    });
  });

  // Favorilere ekleme
  document.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.closest(".product-card").getAttribute("data-id");
      addToFavorites(productId);
    });
  });

  // Sepet yönlendirme
  document.getElementById("cart-link")?.addEventListener("click", () => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (getLoginState() || localCart.length > 0) {
      window.location.href = "cart.html";
    } else {
      localStorage.setItem("redirectAfterLogin", "cart.html");
      localStorage.setItem("loginReason", "cartAccess");
      window.location.href = "login.html";
    }
  });

  // Favoriler yönlendirme
  document.getElementById("favorites-link")?.addEventListener("click", () => {
    if (getLoginState()) {
      window.location.href = "favourites.html";
    } else {
      localStorage.setItem("redirectAfterLogin", "favourites.html");
      localStorage.setItem("loginReason", "favoritesAccess");
      window.location.href = "login.html";
    }
  });

  // Giriş sayfasına yönlendirme
  document.getElementById("login-link")?.addEventListener("click", () => {
    window.location.href = "login.html";
  });

  // Arama kutusu işlemleri
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
    products
      .filter((p) => p.name.toLowerCase().includes(q))
      .forEach((p) => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.innerHTML = `<img src="${p.image}" alt="${p.name}" /><span>${p.name}</span>`;
        item.onclick = () => (window.location.href = p.link);
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
      if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
    }
  });
});
