import { baseURL } from "./config.js";
import { getLoginState, setLoginState } from "./script.js";

document
  .getElementById("register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = this.elements[0].value.trim();
    const email = this.elements[1].value.trim();
    const password = this.elements[2].value.trim();
    const confirmPassword = this.elements[3].value.trim();

    // Boş alan kontrolü
    if (!name || !email || !password || !confirmPassword) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    // Şifre uyuşmazlığı kontrolü
    if (password !== confirmPassword) {
      alert("Şifreler uyuşmuyor.");
      return;
    }

    try {
      const res = await fetch(`${baseURL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        const messageBox = document.createElement("div");
        messageBox.textContent =
          "Kayıt başarılı ✅ Giriş sayfasına yönlendiriliyorsunuz.";
        messageBox.style.backgroundColor = "#d4edda";
        messageBox.style.color = "#155724";
        messageBox.style.padding = "12px";
        messageBox.style.border = "1px solid #c3e6cb";
        messageBox.style.borderRadius = "5px";
        messageBox.style.marginTop = "1rem";
        messageBox.style.textAlign = "center";

        document.querySelector("main").appendChild(messageBox);

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        alert("Hata: " + data.error);
      }
    } catch (err) {
      alert("Sunucu hatası.");
    }
  });

function togglePassword(inputId, toggleIcon) {
  const input = document.getElementById(inputId);
  const img = toggleIcon.querySelector("img");
  const isHidden = input.type === "password";

  input.type = isHidden ? "text" : "password";
  img.src = isHidden ? "/images/visibility-off.svg" : "/images/visibility.svg";
  img.alt = isHidden ? "Gizle" : "Göster";
}
window.togglePassword = togglePassword;
