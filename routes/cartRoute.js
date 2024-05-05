const express = require("express");
const {
  addToCart,
  checkoutCart,
  updateCart,
  removeFromCart,
  getCarts,
} = require("../controller/cartController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

//http://localhost:3000/api/shoes?brand=Adidas&gender=Female&type=Casual&colorName=Blue&minPrice=50&maxPrice=150
router.post("/carts", verifyAccessToken, addToCart);
router.put("/carts/:cartItemId", verifyAccessToken, updateCart);
router.delete("/carts/:cartItemId", verifyAccessToken, removeFromCart);
router.get("/carts", verifyAccessToken, getCarts);
router.get("/carts/checkout", verifyAccessToken, checkoutCart);

module.exports = { cartRoute: router };
