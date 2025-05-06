import { baseURL } from "./config.js";
import {
  showToast,
  updateLoginUI,
  getLoginState,
  setLoginState,
} from "./script.js";

const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
// Giriş durumu kontrolü
router.put("/cart/update-quantity", async (req, res) => {
  const { productId, change } = req.body;
  const userId = req.cookies?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Kullanıcı kimliği bulunamadı." });
  }

  try {
    const cartItem = await Cart.findOne({ userId, productId });

    if (!cartItem) {
      return res.status(404).json({ message: "Ürün bulunamadı." });
    }

    cartItem.quantity += change;

    if (cartItem.quantity <= 0) {
      await cartItem.deleteOne();
    } else {
      await cartItem.save();
    }

    res.status(200).json({ message: "Quantity güncellendi." });
  } catch (err) {
    console.error("Quantity update hatası:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

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

function attachQuantityListeners() {
  if (!getLoginState()) return; // sadece giriş yapılmış kullanıcılar

  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
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
        <img src="images/empty-cart.png" alt="Boş Sepet" />
        <p>Sepetinizde ürün bulunmamaktadır 🧺</p>
      </div>`;
    return;
  }

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-info">
        <h3>${item.name}</h3>
        <p>Fiyat: ${item.price.toFixed(2)} ₺</p>
        <p>Miktar: ${item.quantity}</p>
        <button class="delete-btn" data-id="${item._id}">Sil</button>
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
