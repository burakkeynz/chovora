require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "chovora_secret_key";
console.log("🔐 JWT_SECRET:", JWT_SECRET);

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Yetkisiz erişim. Token bulunamadı." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ error: "Geçersiz veya süresi dolmuş token." });
  }
};

module.exports = verifyToken;
