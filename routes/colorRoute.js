const express = require("express");
const {
  addColor,
  updateColor,
  deleteColor,
  getAllColors,
  getColor,
} = require("../controller/colorController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/shoes/:shoeId", upload.single("image"), addColor);

router.get("/shoes/:shoeId/colors/:colorId", getColor);

router.get("/shoes/:shoeId/colors", getAllColors);

// router.post("/shoes/:shoeId/colors", addColor);

router.put("/shoes/:shoeId/colors/:colorId", updateColor);

router.delete("/shoes/:shoeId/colors/:colorId", deleteColor);

module.exports = { colorRoute: router };
