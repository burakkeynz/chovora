const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
});

module.exports = mongoose.model("Favourite", favouriteSchema);
