const express = require("express");
const {
  getAllSize,
  getSize,
  updateSize,
  deleteSize,
  createSize,
} = require("../controller/sizeController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

router.get("/shoes/:shoeId/colors/:colorId/sizes", getAllSize);

router.post("/shoes/:shoeId/colors/:colorId/sizes", createSize);

router.get("/shoes/:shoeId/colors/:colorId/sizes/:sizeId", getSize);

router.put("/shoes/:shoeId/colors/:colorId/sizes/:sizeId", updateSize);

router.delete("/shoes/:shoeId/colors/:colorId/sizes/:sizeId", deleteSize);

module.exports = { sizeRoute: router };
