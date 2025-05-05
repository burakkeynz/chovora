const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: String,
    price: Number,
    image: String,
    quantity: { type: Number, default: 1 },
  },
  { _id: false } // opsiyonel: her ürün için ekstra _id oluşturmaz
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: { type: [cartItemSchema], default: [] },
  favorites: { type: Array, default: [] },
});

module.exports = mongoose.model("User", userSchema);
