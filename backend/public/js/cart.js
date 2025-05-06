import { baseURL } from "./config.js"; // config.js URL

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button").forEach((btn) => {
    if (!btn.type || btn.type.toLowerCase() === "submit") {
      btn.type = "button";
    }
  });

  const raw = localStorage.getItem("cart");
  let localCart = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) localCart = parsed;
  } catch (err) {
    console.warn("⛔ Sepet verisi çözülemedi:", err);
  }

  const isCartEmpty = localCart.length === 0;

  fetch(`${baseURL}/api/auth/check-auth`, {
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        //  Giriş yapılmış  backend'den yükle
        loadCart();
      } else {
        if (isCartEmpty) {
          // 👀 Sepet boş → sadece boş göster
          renderEmptyCart();
        } else {
          // 🛑 Sepette ürün var → login'e yönlendir
          localStorage.setItem("redirectAfterLogin", "cart.html");
          localStorage.setItem("loginReason", "cartAccess");
          window.location.href = "login.html";
        }
      }
    })
    .catch((err) => {
      console.error("Check-auth hatası:", err);
      if (isCartEmpty) {
        renderEmptyCart();
      } else {
        localStorage.setItem("redirectAfterLogin", "cart.html");
        localStorage.setItem("loginReason", "cartAccess");
        window.location.href = "login.html";
      }
    });
});

// 🔄 Sepeti backend'den yükle
async function loadCart() {
  const cartItemsEl = document.getElementById("cart-items");
  const emptyCartEl = document.getElementById("empty-cart");
  const totalPriceEl = document.getElementById("total-price");
  const summaryEl = document.getElementById("cart-summary");

  cartItemsEl.innerHTML = "";
  emptyCartEl.style.display = "none";
  summaryEl.style.display = "none";

  const renderItems = (cart) => {
    if (!cart || cart.length === 0) return renderEmptyCart();

    cartItemsEl.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      const itemEl = document.createElement("div");
      itemEl.classList.add("cart-item");
      itemEl.dataset.index = index.toString();
      itemEl.dataset.productId = item.productId;
      itemEl.dataset.price = item.price;

      itemEl.innerHTML = `
        <div class="cart-item-left">
          <img src="${item.image}" class="cart-img" alt="${item.name}" />
        </div>
        <div class="cart-item-right">
          <div class="cart-item-top">
            <p class="cart-item-name"><strong>${item.name}</strong></p>
            <p class="cart-item-price">₺<span>${item.price}</span></p>
            <button class="delete-btn" data-index="${index}">Sil</button>
          </div>
        </div>
      `;

      const rightDiv = itemEl.querySelector(".cart-item-right");
      const deleteBtn = itemEl.querySelector(".delete-btn");
      deleteBtn.type = "button";
      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        removeFromCart(e.target);
      });

      const bottomDiv = document.createElement("div");
      bottomDiv.classList.add("cart-item-bottom");

      const label = document.createElement("span");
      label.textContent = "Miktar:";

      const minusBtn = createQtyButton("-", index, "dec");
      const qtySpan = document.createElement("span");
      qtySpan.textContent = item.quantity;
      qtySpan.classList.add("item-quantity");
      const plusBtn = createQtyButton("+", index, "inc");

      bottomDiv.append(label, minusBtn, qtySpan, plusBtn);
      rightDiv.appendChild(bottomDiv);
      cartItemsEl.appendChild(itemEl);

      total += item.price * item.quantity;
    });

    totalPriceEl.textContent = `₺${total.toFixed(2)}`;
    summaryEl.style.display = "block";
  };

  try {
    const res = await fetch(`${baseURL}/api/cart`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("API hatası");
    const data = await res.json();
    renderItems(data.cart);
  } catch (err) {
    console.error("Backend hatası:", err);
    renderEmptyCart();
  }
}

function createQtyButton(sign, index, action) {
  const btn = document.createElement("button");
  btn.textContent = sign;
  btn.type = "button";
  btn.classList.add("qty-btn", action === "inc" ? "plus" : "minus");

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await updateQuantity(index, action, e.target);
  });

  return btn;
}

// Miktar güncelle
async function updateQuantity(index, action, buttonElement) {
  const cartItem = buttonElement.closest(".cart-item");
  const quantitySpan = cartItem?.querySelector(".item-quantity");

  if (!cartItem || !quantitySpan) return;

  const currentQuantity = parseInt(quantitySpan.textContent);
  if (action === "dec" && currentQuantity <= 1) return;

  try {
    const res = await fetch(`${baseURL}/api/cart/${index}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ action }),
    });

    if (!res.ok) return;

    const newQuantity =
      action === "inc" ? currentQuantity + 1 : currentQuantity - 1;
    quantitySpan.textContent = newQuantity;
    updateTotalPrice();
  } catch (err) {
    console.error("Güncelleme hatası:", err);
  }
}

//  Toplam fiyatı güncelle
function updateTotalPrice() {
  const cartItems = document.querySelectorAll(".cart-item");
  let total = 0;
  cartItems.forEach((item) => {
    const price = parseFloat(item.dataset.price || "0");
    const quantity = parseInt(
      item.querySelector(".item-quantity")?.textContent || "0"
    );
    console.log("🧾 Ürün:", item);
    total += price * quantity;
  });
  const totalPriceEl = document.getElementById("total-price");
  if (totalPriceEl) totalPriceEl.textContent = `₺${total.toFixed(2)}`;
}

//  Silme işlemi
async function removeFromCart(buttonElement) {
  const cartItem = buttonElement.closest(".cart-item");
  const productId = cartItem?.dataset.productId;

  if (!productId || !cartItem) return;

  try {
    const res = await fetch(`${baseURL}/api/cart/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Silme başarısız");

    cartItem.remove();
    updateTotalPrice();

    const remaining = document.querySelectorAll(".cart-item");
    if (remaining.length === 0) renderEmptyCart();
  } catch (err) {
    console.error("Silme hatası:", err);
  }
}

//  Boş sepet
function renderEmptyCart() {
  document.getElementById("cart-items").innerHTML = "";
  document.getElementById("empty-cart").style.display = "block";
  document.getElementById("cart-summary").style.display = "none";
}
