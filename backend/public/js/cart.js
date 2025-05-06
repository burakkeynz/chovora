import { baseURL } from "./config.js";
import {
  showToast,
  updateLoginUI,
  getLoginState,
  setLoginState,
} from "./script.js";

async function checkAuth() {
  try {
    const res = await fetch(`${baseURL}/api/auth/check-auth`, {
      credentials: "include",
    });
    setLoginState(res.ok);
  } catch (err) {
    setLoginState(false);
  }
}

// LocalStorage'dan ürünleri backend'e taşır (login sonrası)
async function mergeCartWithBackend() {
  const localCart = JSON.parse(localStorage.getItem("cart")) || [];
  if (localCart.length === 0) return;

  for (const item of localCart) {
    await fetch(`${baseURL}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ product: item }),
    });
  }

  localStorage.removeItem("cart");
}

// Favori butonu
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
      if (!res.ok) throw new Error();
      showToast("Ürün favorilere eklendi 💛");
    })
    .catch(() => showToast("Favori eklenemedi."));
}
window.addToFavorites = addToFavorites;

// + / - butonları
function attachQuantityListeners() {
  if (!getLoginState()) return;

  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      e.preventDefault();
      const isIncrease = btn.classList.contains("increase");
      const itemEl = btn.closest(".cart-item");
      const productId = itemEl.querySelector(".delete-btn").dataset.id;

      await fetch(`${baseURL}/api/cart/update-quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId,
          change: isIncrease ? 1 : -1,
        }),
      });

      location.reload();
    });
  });
}

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
            <button class="qty-btn decrease" type="button">−</button>
            <span class="product-qty">${item.quantity}</span>
            <button class="qty-btn increase" type="button">+</button>
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

  attachQuantityListeners();
}

// Sayfa yüklenince çalışır
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();
  updateLoginUI();

  if (getLoginState()) {
    await mergeCartWithBackend();
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
