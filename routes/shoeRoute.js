const express = require("express");
const {
  getAllShoes,
  getSingleShoe,
  createShoe,
  updateShoe,
  addColor,
  updateColor,
  deleteColor,
  deleteShoe,
  getAllBrands,
} = require("../controller/shoeController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//http://localhost:3000/api/shoes?brand=Adidas&gender=Female&type=Casual&colorName=Blue&minPrice=50&maxPrice=150
router.get("/shoes", getAllShoes);

router.post("/shoes", createShoe);

router.get("/shoes/:id", getSingleShoe);

router.put("/shoes/:id", updateShoe);

router.get("/shoes/:id", deleteShoe);

router.post("/shoes/:shoeId", upload.single("image"), addColor);

router.post("/shoes/:shoeId/colors", addColor);

router.put("/colors/:colorId", updateColor);

router.delete("/colors/:colorId", deleteColor);

router.get("/brands", getAllBrands);

module.exports = { shoeRoute: router };
