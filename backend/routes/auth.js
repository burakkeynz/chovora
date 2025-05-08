const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "chovora_secret_key";

// Kayıt
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Bu e-posta zaten kayıtlı." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Kayıt başarılı!" });
  } catch (err) {
    console.error("Kayıt hatası:", err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

// Giriş
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Geçersiz e-posta." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Geçersiz şifre." });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Token
    res.status(200).json({
      message: "Giriş başarılı!",
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Giriş hatası:", err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

//Giriş kontrolü-tokenle
router.get("/check-auth", (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Giriş yapılmamış." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ userId: decoded.userId });
  } catch (err) {
    return res.status(401).json({ error: "Geçersiz token." });
  }
});

// Çıkış
router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.status(200).json({ message: "Çıkış yapıldı." });
});

module.exports = router;
