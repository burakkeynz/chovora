import { baseURL } from "./config.js"; // config.js'den baseURL'i alıyoruz

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // default submit davranısını engelleme

    const name = form.elements[0].value.trim();
    const email = form.elements[1].value.trim();
    const phone = form.elements[2].value.trim();
    const message = form.elements[3].value.trim();

    // Formun boş bırakılmaması için basit kontrol
    if (!name || !email || !message) {
      alert("Lütfen gerekli alanları doldurun.");
      return;
    }

    const data = {
      name,
      email,
      phone,
      message,
    };

    try {
      const response = await fetch(`${baseURL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.location.href = "/thanks.html";
      } else {
        const errorData = await response.json();
        alert("Hata oluştu: " + (errorData.error || "Bilinmeyen hata"));
      }
    } catch (err) {
      console.error("İstek hatası:", err);
      alert("Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
    }
  });
});
