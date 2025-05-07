require("dotenv").config(); // .env dosyasını yükle
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const favouriteRoutes = require("./routes/favourites");
const cartRoutes = require("./routes/cart");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

connectDB();
const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL,
  "https://chovora.vercel.app",
  "https://www.chovora.com",
  "https://chovora.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        console.error("CORS BLOCKED ORIGIN:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Rotalar
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", favouriteRoutes);

//  Statik dosyalar
app.use(express.static(path.join(__dirname, "public")));

//  İletişim Formu
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZMAIL_USER,
    pass: process.env.ZMAIL_PASS,
  },
});

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  console.log("Yeni form geldi:", { name, email, phone, message });

  const mailOptions = {
    from: `"Chovora" <${process.env.ZMAIL_USER}>`,
    to: email,
    subject: "Chovora – Talebiniz Alındı",
    text: `Merhaba ${name},\n\nİletmiş olduğunuz mesajı aldık. En kısa sürede size geri dönüş sağlayacağız.\n\nChovora ekibi olarak teşekkür ederiz.\n\n– Chovora`,
  };

  const adminMailOptions = {
    from: `"Chovora Form" <${process.env.ZMAIL_USER}>`,
    to: process.env.ZMAIL_USER,
    subject: "Yeni Form Bildirimi - Chovora",
    text: `Yeni form gönderildi:\n\nAd: ${name}\nE-posta: ${email}\nTelefon: ${phone}\nMesaj: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(adminMailOptions);
    res
      .status(200)
      .json({ success: true, message: "Form alındı, mail gönderildi!" });
  } catch (error) {
    console.error("Mail gönderilemedi:", error);
    res
      .status(500)
      .json({ success: false, error: "Mail gönderimi başarısız." });
  }
});

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `✅ Backend çalışıyor: ${
      process.env.BACKEND_URL || "http://localhost:3000"
    }`
  );
});
