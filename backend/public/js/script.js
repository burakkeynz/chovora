import { baseURL } from "./config.js";

let isUserLoggedIn = false;

export function setLoginState(state) {
  isUserLoggedIn = state;
}

export function getLoginState() {
  return isUserLoggedIn;
}

// Sadece login durumunu kontrol eder
export async function checkAuth() {
  try {
    const res = await fetch(`${baseURL}/api/auth/check-auth`, {
      credentials: "include",
    });
    setLoginState(res.ok);
  } catch (err) {
    console.warn("check-auth error:", err);
    setLoginState(false);
  }
}
function showElementSmoothly(idToShow, idToHide) {
  const elShow = document.getElementById(idToShow);
  const elHide = document.getElementById(idToHide);

  if (elHide) {
    elHide.classList.remove("visible");
    setTimeout(() => {
      elHide.style.display = "none";
    }, 300);
  }

  if (elShow) {
    elShow.style.display = "flex"; // flex'i hemen veririz
    setTimeout(() => {
      elShow.classList.add("visible"); // ardından opacity geçişi başlar
    }, 10); // 10ms yeterli
  }
}

// Login ve logout butonlarını göster/gizle
export function updateLoginUI() {
  if (getLoginState()) {
    showElementSmoothly("logout-link", "login-link");
  } else {
    showElementSmoothly("login-link", "logout-link");
  }
}

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

// Favorilere ekleme işlemi
function addToFavorites(productId) {
  if (!productId) return;

  if (!isUserLoggedIn) {
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
  await checkAuth();
  updateLoginUI();

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

  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      if (e.target.closest(".buy-btn") || e.target.closest(".fav-btn")) return;
      const id = this.getAttribute("data-id");
      window.location.href =
        id === "tekli" ? "product-single.html" : "product-box.html";
    });
  });

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

  document.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.closest(".product-card").getAttribute("data-id");
      addToFavorites(productId);
    });
  });

  document.getElementById("cart-link")?.addEventListener("click", () => {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (getLoginState() || localCart.length > 0) {
      window.location.href = "cart.html";
    } else {
      localStorage.removeItem("loginReason");
      localStorage.setItem("redirectAfterLogin", "cart.html");
      localStorage.setItem("loginReason", "cartAccess");
      window.location.href = "login.html";
    }
  });

  document.getElementById("favorites-link")?.addEventListener("click", () => {
    if (getLoginState()) {
      window.location.href = "favourites.html";
    } else {
      localStorage.removeItem("loginReason");
      localStorage.setItem("redirectAfterLogin", "favourites.html");
      localStorage.setItem("loginReason", "favoritesAccess");
      window.location.href = "login.html";
    }
  });

  document.getElementById("login-link")?.addEventListener("click", () => {
    window.location.href = "login.html";
  });

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
