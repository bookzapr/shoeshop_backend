const express = require("express");
const {
  createOwnOrder,
  getOwnAllOrder,
  getAllOrder,
  getSingleOrder,
  checkoutOwnOrder,
  orderWebHook,
} = require("../controller/orderController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

router.post("/orders", verifyAccessToken, createOwnOrder);
router.get("/orders", verifyAccessToken, getOwnAllOrder);
// router.get("/orders/:orderId/checkout", getOwnSingleOrder);
router.get("/orders/:orderId/checkout", checkoutOwnOrder);
router.get("/orders/users/:userId", getAllOrder);
router.get("/orders/:orderId", getSingleOrder);
router.post("/orders/webhook", orderWebHook);

module.exports = { orderRoute: router };
