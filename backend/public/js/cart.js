import { baseURL } from "./config.js";
import { showToast, updateLoginUI } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("cart-items");
  if (!container) return;

  fetch(`${baseURL}/api/cart`, {
    method: "GET",
    credentials: "include",
  })
    .then(async (res) => {
      if (res.status === 401) {
        localStorage.setItem("redirectAfterLogin", "cart.html");
        localStorage.setItem("loginReason", "cartAccess");
        window.location.href = "login.html";
        return;
      }

      const data = await res.json();
      const items = data.cart || [];

      if (!items.length) {
        container.innerHTML = `
          <div class="empty-cart">
            <img src="images/empty-cart.png" alt="Boş Sepet" class="empty-image" />
            <p>Sepetinizde ürün bulunmamaktadır 🧺</p>
          </div>`;
        document.getElementById("empty-cart").style.display = "block";
        document.getElementById("cart-summary").style.display = "none";
        return;
      }

      renderCartItems(items);
    })
    .catch(() => {
      container.innerHTML = `<p style="text-align:center">Sepeti görüntülemek için giriş yapmalısınız.</p>`;
    });
});

function renderCartItems(items) {
  const container = document.getElementById("cart-items");
  container.innerHTML = "";

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

  document.getElementById("cart-summary").style.display = "block";
  attachQuantityListeners();
  attachDeleteListeners();
  recalculateTotalPrice();
}

function attachDeleteListeners() {
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");

      try {
        await fetch(`${baseURL}/api/cart/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        btn.closest(".cart-item").remove();
        showToast("Ürün sepetten kaldırıldı ❌");

        const remainingItems = document.querySelectorAll(".cart-item").length;
        document.getElementById("empty-cart").style.display =
          remainingItems === 0 ? "block" : "none";
        document.getElementById("cart-summary").style.display =
          remainingItems === 0 ? "none" : "block";

        recalculateTotalPrice();
      } catch {
        showToast("Silme işlemi başarısız.");
      }
    });
  });
}

function attachQuantityListeners() {
  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const isIncrease = this.classList.contains("increase");
      const itemEl = this.closest(".cart-item");
      const qtySpan = itemEl.querySelector(".product-qty");
      const productId = itemEl.querySelector(".delete-btn").dataset.id;

      const res = await fetch(`${baseURL}/api/cart/update-quantity`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, change: isIncrease ? 1 : -1 }),
      });

      if (!res.ok) {
        showToast("Miktar güncellenemedi.");
        return;
      }

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
    });
  });
}

function recalculateTotalPrice() {
  let total = 0;
  document.querySelectorAll(".cart-item").forEach((item) => {
    const qty = parseInt(item.querySelector(".product-qty")?.textContent || 0);
    const price = parseFloat(
      item.querySelector(".cart-item-price")?.textContent.replace("₺", "")
    );
    total += qty * price;
  });

  const totalPriceEl = document.getElementById("total-price");
  if (totalPriceEl) totalPriceEl.textContent = `₺${total.toFixed(2)}`;
}
