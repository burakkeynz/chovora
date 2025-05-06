import { baseURL } from "./config.js";
import { showToast } from "./script.js";
import { getLoginState, setLoginState } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("favorites-container");
  if (!container) return;

  fetch(`${baseURL}/api/favourites`, {
    method: "GET",
    credentials: "include",
  })
    .then(async (res) => {
      if (res.status === 401) {
        localStorage.setItem("redirectAfterLogin", "favourites.html");
        localStorage.setItem("loginReason", "favoritesAccess");
        window.location.href = "login.html";
        return;
      }

      const data = await res.json();
      const { favorites } = data;

      if (!favorites || favorites.length === 0) {
        container.innerHTML = `<p style="text-align:center">Henüz favori ürününüz yok.</p>`;
        return;
      }

      const productData = {
        tekli: {
          name: "Chovora Tekli Bar",
          price: 38.9,
          image: "/images/packet.png",
          link: "/product-single.html",
        },
        "12li": {
          name: "Tanışma Paketi (12'li)",
          price: 326.76,
          image: "/images/chovora-box.jpg",
          link: "/product-box.html",
        },
      };

      favorites.forEach((id) => {
        const p = productData[id];
        if (!p) return;

        const card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-id", id);

        card.innerHTML = `
          <img src="${p.image}" alt="${p.name}" class="product-img" />
          <div class="product-info">
            <h3>${p.name}</h3>
            <p class="price">₺${p.price.toFixed(2)}</p>
            <button class="detail-btn" onclick="window.location.href='${
              p.link
            }'">Ürün Bilgileri</button>
            <button class="remove-btn" data-id="${id}">Favorilerden Çıkar</button>
          </div>
        `;

        container.appendChild(card);
      });

      document.querySelectorAll(".remove-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const productId = btn.getAttribute("data-id");
          removeFromFavorites(productId);
        });
      });
    })
    .catch(() => {
      container.innerHTML = `<p style="text-align:center">Favorilerinizi görmek için giriş yapmalısınız.</p>`;
    });
});

function removeFromFavorites(productId) {
  fetch(`${baseURL}/api/favourites/${productId}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Silinemedi");

      const cardToRemove = document.querySelector(`[data-id="${productId}"]`);
      if (cardToRemove) {
        cardToRemove.remove();
        showToast("Ürün favorilerden çıkarıldı ❌");
      }

      const container = document.getElementById("favorites-container");
      if (container && container.children.length === 0) {
        container.innerHTML = `<p style="text-align:center">Henüz favori ürününüz yok.</p>`;
      }
    })
    .catch(() => {
      showToast("Silme işlemi başarısız.");
    });
}
