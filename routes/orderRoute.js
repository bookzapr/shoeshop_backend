const express = require("express");
const {
  createOwnOrder,
  getOwnAllOrder,
  getAllOrder,
  getSingleOrder,
} = require("../controller/orderController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

router.post("/orders", verifyAccessToken, createOwnOrder);
router.get("/orders", verifyAccessToken, getOwnAllOrder);
router.get("/orders/users/:userId", getAllOrder);
router.get("/orders/:orderId", getSingleOrder);

module.exports = { orderRoute: router };
