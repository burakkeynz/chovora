const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const Cart = require("../models/Cart");

const router = express.Router();

// 🛒 Sepeti Listele
router.get("/cart", verifyToken, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.userId });

    const enrichedCart = cartItems.map((item) => ({
      productId: item.productId,
      name: item.name || "Bilinmeyen Ürün",
      price: item.price || 0,
      image: item.image || "/images/default.png",
      quantity: item.quantity,
    }));

    res.status(200).json({ cart: enrichedCart });
  } catch (err) {
    res.status(500).json({ error: "Sepet yüklenemedi." });
  }
});

// ➕ Sepete Ürün Ekle
router.post("/cart", verifyToken, async (req, res) => {
  const { product } = req.body;

  try {
    const existing = await Cart.findOne({
      userId: req.user.userId,
      productId: product.productId,
    });

    if (existing) {
      existing.quantity += 1;
      await existing.save();
      return res.status(200).json({ message: "Miktar artırıldı." });
    }

    const newItem = new Cart({
      userId: req.user.userId,
      productId: product.productId,
      name: product.name, // ✅ yeni eklendi
      price: product.price, // ✅ yeni eklendi
      image: product.image, // ✅ yeni eklendi
      quantity: product.quantity || 1,
      addedAt: new Date(),
    });

    await newItem.save();
    res.status(201).json({ message: "Ürün sepete eklendi." });
  } catch (err) {
    res.status(500).json({ error: "Ürün eklenemedi." });
  }
});

// 🔄 Miktar Güncelle
router.put("/cart/:index", verifyToken, async (req, res) => {
  const { action } = req.body;

  try {
    const cartItems = await Cart.find({ userId: req.user.userId });

    const item = cartItems[req.params.index];
    if (!item) return res.status(404).json({ error: "Ürün bulunamadı." });

    if (action === "inc") item.quantity += 1;
    if (action === "dec" && item.quantity > 1) item.quantity -= 1;

    await item.save();
    res.status(200).json({ message: "Miktar güncellendi." });
  } catch (err) {
    res.status(500).json({ error: "Güncelleme başarısız." });
  }
});

// ❌ Ürün Sil
router.delete("/cart/:productId", verifyToken, async (req, res) => {
  try {
    await Cart.deleteOne({
      userId: req.user.userId,
      productId: req.params.productId,
    });
    res.status(200).json({ message: "Ürün silindi." });
  } catch (err) {
    res.status(500).json({ error: "Silme işlemi başarısız." });
  }
});

module.exports = router;
