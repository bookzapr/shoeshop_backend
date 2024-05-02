const express = require("express");
const {
  getAllShoes,
  createShoe,
  getSingleShoe,
  updateShoe,
  deleteShoe,
  getAllBrands,
} = require("../controller/shoeController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

//http://localhost:3000/api/shoes?brand=Adidas&gender=Female&type=Casual&colorName=Blue&minPrice=50&maxPrice=150
router.get("/shoes", getAllShoes);

router.post("/shoes", createShoe);

router.get("/shoes/:id", getSingleShoe);

router.put("/shoes/:id", updateShoe);

router.delete("/shoes/:id", deleteShoe);

router.get("/brands", getAllBrands);

module.exports = { shoeRoute: router };
