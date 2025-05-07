import { baseURL } from "./config.js";
import { showToast, updateLoginUI } from "./script.js";
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("cart-items");
  if (!container) return;

  fetch(`${baseURL}/api/cart/update-quantity-test`, {
    method: "PUT",
  });

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
      renderCartItems(data.cart || []);
    })
    .catch(() => {
      container.innerHTML =
        "<p style='text-align:center'>Sepeti görüntülemek için giriş yapmalısınız.</p>";
    });
});
function renderCartItems(items) {
  const container = document.getElementById("cart-items");

  // 🛑 EMPTY CART kontrolü eklendi
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div id="empty-cart">
        <img src="/images/empty-cart.png" alt="Empty cart" />
        <h3>Empty cart</h3>
        <p>Your shopping cart is empty.</p>
      </div>
    `;
    document.getElementById("cart-summary").style.display = "none"; // toplam fiyat vs. gizle
    return;
  }

  // 🔁 Doluysa ürünleri listele
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
          <button class="delete-btn" data-id="${item._id}">Sil</button>
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
      if (!productId) {
        showToast("Ürün ID'si alınamadı.");
        return;
      }

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
      }

      const remainingItems = document.querySelectorAll(".cart-item").length;
      if (remainingItems === 0) {
        renderCartItems([]); // 🛒 Boş sepet görünümünü tetikle
      } else {
        qtySpan.textContent = currentQty;
      }

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
