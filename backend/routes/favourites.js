const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const Favourite = require("../models/Favourite");

const router = express.Router();

// Tüm favorileri getir
router.get("/favourites", verifyToken, async (req, res) => {
  try {
    const favs = await Favourite.find({ userId: req.user.userId });
    const productIds = favs.map((f) => f.productId);
    res.status(200).json({ favorites: productIds });
  } catch (err) {
    res.status(500).json({ error: "Favoriler yüklenemedi." });
  }
});

// Favoriye ekle
router.post("/favourites", verifyToken, async (req, res) => {
  const { productId } = req.body;
  try {
    const exists = await Favourite.findOne({
      userId: req.user.userId,
      productId,
    });

    if (exists) {
      return res.status(409).json({ message: "Zaten favorilerde." });
    }

    const newFav = new Favourite({
      userId: req.user.userId,
      productId,
    });
    await newFav.save();

    res.status(201).json({ message: "Favorilere eklendi." });
  } catch (err) {
    res.status(500).json({ error: "Favori eklenemedi." });
  }
});

// Favoriden çıkar
router.delete("/favourites/:productId", verifyToken, async (req, res) => {
  try {
    await Favourite.deleteOne({
      userId: req.user.userId,
      productId: req.params.productId,
    });
    res.status(200).json({ message: "Favorilerden çıkarıldı." });
  } catch (err) {
    res.status(500).json({ error: "Silme başarısız." });
  }
});

module.exports = router;
