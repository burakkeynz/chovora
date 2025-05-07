const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const verifyToken = require("../middleware/verifyToken"); // JWT middleware'i ekle

// 🟢 1. Sepeti getir (GET /api/cart)
router.get("/cart", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const cartItems = await Cart.find({ userId });
    res.status(200).json({ cart: cartItems });
  } catch (err) {
    console.error("Sepet getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// 🟢 2. Sepete ürün ekle (POST /api/cart)
router.post("/cart", verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const { product } = req.body;

  try {
    const existing = await Cart.findOne({
      userId,
      productId: product.productId,
    });
    if (existing) {
      existing.quantity += product.quantity;
      await existing.save();
    } else {
      await Cart.create({ ...product, userId });
    }
    res.status(200).json({ message: "Ürün sepete eklendi." });
  } catch (err) {
    console.error("Ürün ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// 🟢 3. Sepetten ürün sil (DELETE /api/cart/:id)
router.delete("/cart/:id", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    await Cart.deleteOne({ userId, _id: req.params.id });
    res.status(200).json({ message: "Ürün silindi." });
  } catch (err) {
    console.error("Silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.put("api/cart/update-quantity", verifyToken, async (req, res) => {
  const { productId, change } = req.body;
  const userId = req.user.userId;

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

module.exports = router;
