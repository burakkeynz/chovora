import { baseURL } from "./config.js";
import { showToast } from "./script.js";
import { getLoginState, setLoginState } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const infoBox = document.getElementById("login-info-msg");

  // Direkt giriş butonu → önceki yönlendirme bilgisini temizle
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("direct")) {
    localStorage.removeItem("redirectAfterLogin");
    localStorage.removeItem("loginReason");
  }

  const redirectPage = localStorage.getItem("redirectAfterLogin");
  const loginReason = localStorage.getItem("loginReason");

  if (infoBox && redirectPage && loginReason) {
    if (redirectPage === "/chovora-sepet" && loginReason === "cartAccess") {
      infoBox.textContent = "Lütfen sepetinizi görüntülemek için giriş yapın.";
      showToast("Sepetinizi görmek için önce giriş yapın.");
    } else if (
      redirectPage === "/chovora-favoriler" &&
      loginReason === "favoritesAccess"
    ) {
      infoBox.textContent =
        "Favori ürünlerinizi görüntülemek için giriş yapmalısınız.";
      showToast("Favori ürünlere erişmek için giriş yapmalısınız.");
    }
    infoBox.style.display = "block";
  }

  // Form submit işlemi
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = this.elements[0].value.trim();
    const password = this.elements[1].value.trim();

    if (!email || !password) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const res = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        await syncLocalCartToBackend();

        const redirect = localStorage.getItem("redirectAfterLogin");

        // Temizle
        localStorage.removeItem("redirectAfterLogin");
        localStorage.removeItem("loginReason");

        if (redirect) {
          showToast("Giriş başarılı, yönlendiriliyorsunuz...");
          setTimeout(() => {
            window.location.href = redirect;
          }, 1200);
        } else {
          showToast("Giriş başarılı!");
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
      } else {
        alert("Hata: " + data.error);
      }
    } catch (err) {
      alert("Sunucu hatası.");
    }
  });
});

async function syncLocalCartToBackend() {
  const localCart = JSON.parse(localStorage.getItem("cart")) || [];
  await Promise.all(
    localCart.map((product) =>
      fetch(`${baseURL}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify({ product }),
      })
    )
  );
  localStorage.removeItem("cart");
}

export function togglePassword(inputId, toggleIcon) {
  const input = document.getElementById(inputId);
  const img = toggleIcon.querySelector("img");
  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  img.src = isHidden ? "/images/visibility-off.svg" : "/images/visibility.svg";
  img.alt = isHidden ? "Gizle" : "Göster";
}

window.togglePassword = togglePassword;
