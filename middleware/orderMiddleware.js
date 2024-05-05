const { Order } = require("../models/Order");

const mongoose = require("mongoose");

const { findShoeForOrder } = require("./findMiddleware");

async function findOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  return { order };
}

async function acceptOrder(order) {
  return { order };
}

async function rejectOrder(order) {
  for (const item of order.order.items) {
    const { shoeId, colorId, size, quantity } = item;
    const { shoeEntry, sizeEntry } = await findShoeForOrder(
      shoeId,
      colorId,
      size,
      quantity
    );
    sizeEntry.quantity += quantity;
    await shoeEntry.save();
  }

  // await order.save();
  order.order.status = "Cancelled";

  await order.order.save();
}

async function rejectOrder(order) {
  order.order.status = "Processing";

  await order.order.save();
}

module.exports = {
  rejectOrder,
  acceptOrder,
};
