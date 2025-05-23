import { getLoginState, setLoginState } from "./script.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("q")?.toLowerCase() || "";

  const container = document.getElementById("search-results");
  const title = document.getElementById("search-title");

  const products = [
    {
      id: "tekli",
      name: "Chovora Tekli Bar",
      price: 38.9,
      image: "/images/packet.png",
      link: "/chovora-urun/tekli", //
    },
    {
      id: "12li",
      name: "Chovora Tanışma Paketi (12'li)",
      price: 326.76,
      image: "/images/chovora-box.jpg",
      link: "/chovora-onikili-kutu",
    },
  ];

  const matched = products.filter((p) => p.name.toLowerCase().includes(query));

  if (matched.length === 0) {
    title.textContent = `"${query}" için sonuç bulunamadı.`;
    return;
  }

  title.textContent = `"${query}" için bulunan ürünler:`;

  matched.forEach((product) => {
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>₺${product.price.toFixed(2)}</p>
      <button onclick="window.location.href='${
        product.link
      }'">Ürün Detayı</button>
    `;
    container.appendChild(card);
  });
});
