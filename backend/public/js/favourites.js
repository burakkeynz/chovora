import { baseURL } from "./config.js";
import { showToast } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("favorites-container");
  if (!container) return;

  fetch(`${baseURL}/api/favourites`, {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Giriş gerekli");
      return res.json();
    })
    .then(({ favorites }) => {
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
            <button class="remove-btn" onclick="removeFromFavorites('${id}')">Favorilerden Çıkar</button>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch(() => {
      container.innerHTML = `<p style="text-align:center">Lütfen giriş yapın.</p>`;
    });
});

function removeFromFavorites(productId) {
  fetch(`${baseURL}/api/favourites/${productId}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Silinemedi");
      // 🧼 DOM'dan kartı kaldır
      const cardToRemove = document.querySelector(`[data-id="${productId}"]`);
      if (cardToRemove) {
        cardToRemove.remove();
        setTimeout(() => cardToRemove.remove(), 300);
      }

      showToast("Ürün favorilerden çıkarıldı ❌");

      const container = document.getElementById("favorites-container");
      if (container && container.children.length === 0) {
        container.innerHTML = `<p style="text-align:center">Henüz favori ürününüz yok.</p>`;
      }
    })
    .catch(() => {
      showToast("Silme işlemi başarısız.");
    });
}
window.removeFromFavorites = removeFromFavorites;
