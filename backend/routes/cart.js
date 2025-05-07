const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const verifyToken = require("../middleware/verifyToken"); // JWT middleware'i ekle

// 1. Sepeti getir (GET /api/cart)
router.get("/", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const cartItem = await Cart.find({ userId });

    res.status(200).json({ cart: cartItems });
  } catch (err) {
    console.error("Sepet getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

// //Test için geçiçi eklendi
// router.put("/update-quantity-test", (req, res) => {
//   res.send("update-quantity çalışıyor ");
// });

// 2. Sepete ürün ekle (POST /api/cart)
router.post("/", verifyToken, async (req, res) => {
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

// 3. Sepetten ürün sil (DELETE /api/cart/:id)
router.delete("/:id", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    await Cart.deleteOne({ userId, _id: req.params.id });
    res.status(200).json({ message: "Ürün silindi." });
  } catch (err) {
    console.error("Silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.put("/update-quantity", verifyToken, async (req, res) => {
  const { productId, change } = req.body;
  const userId = req.user.userId;

  try {
    const cartItem = await Cart.find({ userId });

    // 404 yerine  quantity 0 dön (optimistic UI ile uyumlu hale getirme)
    if (!cartItem) {
      console.warn("Ürün zaten silinmiş, tekrar güncellenemedi:", {
        userId,
        productId,
      });
      return res.status(200).json({ quantity: 0 });
    }

    cartItem.quantity += change;

    if (cartItem.quantity <= 0) {
      await cartItem.deleteOne();
      return res.status(200).json({ quantity: 0 });
    } else {
      await cartItem.save();
      return res.status(200).json({ quantity: cartItem.quantity }); //Sync
    }
  } catch (err) {
    console.error("Quantity update hatası:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

module.exports = router;
