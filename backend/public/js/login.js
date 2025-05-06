import { baseURL } from "./config.js";
import { showToast } from "./script.js";
import { getLoginState, setLoginState } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const infoBox = document.getElementById("login-info-msg");
  const redirectPage = localStorage.getItem("redirectAfterLogin");
  const loginReason = localStorage.getItem("loginReason");

  if (infoBox && redirectPage && loginReason) {
    if (redirectPage === "cart.html" && loginReason === "cartAccess") {
      infoBox.textContent = "Lütfen sepetinizi görüntülemek için giriş yapın.";
      showToast("Sepetinizi görmek için önce giriş yapın.");
    } else if (
      redirectPage === "favourites.html" &&
      loginReason === "favoritesAccess"
    ) {
      infoBox.textContent =
        "Favori ürünlerinizi görüntülemek için giriş yapmalısınız.";
      showToast("Favori ürünlere erişmek için giriş yapmalısınız.");
    }
    infoBox.style.display = "block";
  }

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
        // ✅ Token varsa localStorage'a kaydet
        if (data.token) {
          localStorage.setItem("token", data.token);
          setLoginState(true);
        }

        await syncLocalCartToBackend();

        const redirect = localStorage.getItem("redirectAfterLogin");
        const loginReason = localStorage.getItem("loginReason");

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
            window.location.href = "index.html";
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
        },
        credentials: "include",
        body: JSON.stringify({ product }),
      })
    )
  );
  localStorage.removeItem("cart");
}

function togglePassword(inputId, toggleIcon) {
  const input = document.getElementById(inputId);
  const img = toggleIcon.querySelector("img");
  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  img.src = isHidden ? "/images/visibility-off.svg" : "/images/visibility.svg";
  img.alt = isHidden ? "Gizle" : "Göster";
}
