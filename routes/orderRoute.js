const express = require("express");
const {
  createOwnOrder,
  getOwnAllOrder,
  getAllOrder,
  getSingleOrder,
  checkoutOwnOrder,
  orderWebHook,
  getEveryOrder,
  updateOrderStatus,
} = require("../controller/orderController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

router.post("/orders", verifyAccessToken, createOwnOrder);
router.get("/orders", verifyAccessToken, getOwnAllOrder);
// router.get("/orders/:orderId/checkout", getOwnSingleOrder);
router.get("/orders/:orderId/checkout", verifyAccessToken, checkoutOwnOrder);
router.get("/orders/users/:userId", getAllOrder);
router.get("/orders/all", getEveryOrder);
router.get("/orders/:orderId", getSingleOrder);
router.put("/orders/:orderId", updateOrderStatus);
router.post("/orders/webhook", orderWebHook);

module.exports = { orderRoute: router };
