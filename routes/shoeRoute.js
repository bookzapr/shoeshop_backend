const express = require("express");
const {
  getAllShoes,
  getSingleShoe,
  createShoe,
  addColor,
  deleteShoe,
} = require("../controller/shoeController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//http://localhost:3000/api/shoes?brand=Adidas&gender=Female&type=Casual&colorName=Blue&minPrice=50&maxPrice=150
router.get("/shoes", getAllShoes);

router.post("/shoes", createShoe);

router.post("/shoes/:shoeId", upload.single("image"), addColor);

router.get("/shoes/:id", getSingleShoe);

router.get("/shoes/:id", deleteShoe);

module.exports = { shoeRoute: router };
