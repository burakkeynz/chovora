import { baseURL } from "./config.js";
import {
  showToast,
  updateLoginUI,
  getLoginState,
  setLoginState,
  checkAuth,
} from "./script.js"; // checkAuth fonksiyonu da script.js'ten import edilmeli

function getTokenFromStorage() {
  return localStorage.getItem("token");
}

async function mergeCartWithBackend() {
  const localCart = JSON.parse(localStorage.getItem("cart")) || [];
  if (localCart.length === 0) return;

  for (const item of localCart) {
    await fetch(`${baseURL}/api/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getTokenFromStorage()}`,
      },
      credentials: "include",
      body: JSON.stringify({ product: item }),
    });
  }

  localStorage.removeItem("cart");
}

function recalculateTotalPrice() {
  const totalPriceEl = document.getElementById("total-price");
  let total = 0;

  document.querySelectorAll(".cart-item").forEach((item) => {
    const qty = parseInt(item.querySelector(".product-qty")?.textContent || 0);
    const price = parseFloat(
      item.querySelector(".cart-item-price")?.textContent.replace("₺", "")
    );
    total += qty * price;
  });

  if (totalPriceEl) totalPriceEl.textContent = `₺${total.toFixed(2)}`;
}

function attachQuantityListeners() {
  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (btn.disabled) return;
      btn.disabled = true;

      const isIncrease = this.classList.contains("increase");
      const itemEl = this.closest(".cart-item");
      const qtySpan = itemEl.querySelector(".product-qty");
      const productId = itemEl.querySelector(".delete-btn").dataset.id;

      const res = await fetch(`${baseURL}/api/cart/update-quantity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getTokenFromStorage()}`,
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          change: isIncrease ? 1 : -1,
        }),
      });

      btn.disabled = false;

      if (res.ok) {
        let currentQty = parseInt(qtySpan.textContent);
        currentQty += isIncrease ? 1 : -1;

        if (currentQty <= 0) {
          itemEl.remove();
        } else {
          qtySpan.textContent = currentQty;
        }

        const remainingItems = document.querySelectorAll(".cart-item").length;
        document.getElementById("empty-cart").style.display =
          remainingItems === 0 ? "block" : "none";
        document.getElementById("cart-summary").style.display =
          remainingItems === 0 ? "none" : "block";

        recalculateTotalPrice();
      } else {
        showToast("Quantity güncellenemedi");
      }
    });
  });
}

function renderCartItems(items) {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <img src="images/empty-cart.png" alt="Boş Sepet" class="empty-image" />
        <p>Sepetinizde ürün bulunmamaktadır 🧺</p>
      </div>`;
    document.getElementById("empty-cart").style.display = "block";
    document.getElementById("cart-summary").style.display = "none";
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getTokenFromStorage()}`,
          },
          method: "DELETE",
          credentials: "include",
        });
        showToast("Ürün sepetten kaldırıldı ❌");

        btn.closest(".cart-item").remove();

        const remainingItems = document.querySelectorAll(".cart-item").length;
        document.getElementById("empty-cart").style.display =
          remainingItems === 0 ? "block" : "none";
        document.getElementById("cart-summary").style.display =
          remainingItems === 0 ? "none" : "block";

        recalculateTotalPrice();
      } catch {
        showToast("Silme işlemi başarısız oldu.");
      }
    });
  });

  document.getElementById("cart-summary").style.display = "block";
  attachQuantityListeners();
  recalculateTotalPrice();
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuth();

  if (!getLoginState()) {
    showToast("Sepetinizi görüntülemek için giriş yapmalısınız.");
    window.location.href = "login.html";
    return;
  }

  updateLoginUI();
  await mergeCartWithBackend();

  fetch(`${baseURL}/api/cart`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getTokenFromStorage()}`,
    },
    credentials: "include",
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Sepet verisi geldi:", data);

      renderCartItems(data.cart);
    })
    .catch(() => showToast("Sepet yüklenemedi"));
});
