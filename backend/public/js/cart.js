// ==== FRONTEND - public/js/cart.js ====
import { baseURL } from "./config.js";
import {
  showToast,
  updateLoginUI,
  getLoginState,
  setLoginState,
} from "./script.js";

// Giriş durumu kontrolü
async function checkAuth() {
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

// Sepet ürünlerini render eder
function renderCartItems(items) {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <img src="images/empty-cart.png" alt="Boş Sepet" class="empty-image" />
        <p>Sepetinizde ürün bulunmamaktadır 🧺</p>
      </div>`;
    return;
  }

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-left">
        <img src="${item.image}" alt="${item.name}" class="cart-img" />
      </div>
      <div class="cart-item-right">
        <div class="cart-item-top">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">₺${item.price.toFixed(2)}</span>
          <button class="delete-btn" data-id="${
            item.productId || item._id
          }">Sil</button>
        </div>
        <div class="cart-item-bottom">
          <span>Miktar:</span>
          <div class="quantity-controls">
            <button class="qty-btn decrease">−</button>
            <span class="product-qty">${item.quantity}</span>
            <button class="qty-btn increase">+</button>
          </div>
        </div>
      </div>`;
    container.appendChild(div);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      try {
        await fetch(`${baseURL}/api/cart/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        showToast("Ürün sepetten kaldırıldı ❌");
        location.reload();
      } catch {
        showToast("Silme işlemi başarısız oldu.");
      }
    });
  });
}

// Sayfa yüklenince çalışır

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  updateLoginUI();

  if (getLoginState()) {
    fetch(`${baseURL}/api/cart`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => renderCartItems(data.cart))
      .catch(() => showToast("Sepet yüklenemedi"));
  } else {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];
    renderCartItems(localCart);
  }
});
