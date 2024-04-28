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
  getAllColors,
  getColor,
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

router.delete("/shoes/:id", deleteShoe);

router.post("/shoes/:shoeId", upload.single("image"), addColor);

router.get("/shoes/:shoeId/colors", getAllColors);

router.post("/shoes/:shoeId/colors", addColor);

router.put("/shoes/:shoeId/colors/:colorId", updateColor);

router.delete("/shoes/:shoeId/colors/:colorId", deleteColor);

router.get("/shoes/:shoeId/colors/:colorId", getColor);

// router.get("/shoes/:shoeId/colors/:colorId/sizes");

router.get("/brands", getAllBrands);

module.exports = { shoeRoute: router };
