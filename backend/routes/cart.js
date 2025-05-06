const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// Quantity güncelleme
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

module.exports = router;
