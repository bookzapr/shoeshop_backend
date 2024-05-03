const { Shoe, Color, Size } = require("../models/Shoe");

const { Order } = require("../models/Order");

const {
  findAndValidateShoe,
  findOrder,
} = require("../middleware/findMiddleware");

const mongoose = require("mongoose");

const getSingleOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await findOrder(orderId);

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    let status = 500;
    if (
      err.message.includes("not found") ||
      err.message.includes("Insufficient")
    ) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

const getAllOrder = async (req, res) => {
  let { userId } = req.params;

  const { page = 1, length = 10, status } = req.query;

  let query = "";

  if (status && status.toLowerCase()) {
    switch (status) {
      case "pending":
        query = "Pending";
        break;
      case "processing":
        query = "Processing";
        break;
      case "shipping":
        query = "Shipping";
        break;
      case "delivered":
        query = "Delivered";
        break;
    }
  }

  const startIndex = (page - 1) * length;
  const limit = parseInt(length);

  try {
    let orders;
    if (query !== "") {
      orders = await Order.find({ user: userId, status: query })
        .skip(startIndex)
        .limit(limit);
    } else {
      orders = await Order.find({ user: userId }).skip(startIndex).limit(limit);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orders,
    });
  } catch (err) {
    console.error(err);
    let status = 500;
    if (
      err.message.includes("not found") ||
      err.message.includes("Insufficient")
    ) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

const getOwnAllOrder = async (req, res) => {
  let userId = req.userId;

  const { page = 1, length = 10, status } = req.query;

  let query = "";

  if (status && status.toLowerCase()) {
    switch (status) {
      case "pending":
        query = "Pending";
        break;
      case "processing":
        query = "Processing";
        break;
      case "shipping":
        query = "Shipping";
        break;
      case "delivered":
        query = "Delivered";
        break;
    }
  }

  const startIndex = (page - 1) * length;
  const limit = parseInt(length);

  try {
    let orders;
    if (query !== "") {
      orders = await Order.find({ user: userId, status: query })
        .skip(startIndex)
        .limit(limit);
    } else {
      orders = await Order.find({ user: userId }).skip(startIndex).limit(limit);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orders,
    });
  } catch (err) {
    console.error(err);
    let status = 500;
    if (
      err.message.includes("not found") ||
      err.message.includes("Insufficient")
    ) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

const createOwnOrder = async (req, res) => {
  const { items } = req.body;
  const userId = req.userId;

  try {
    // const existingPendingOrder = await Order.findOne({
    //   user: userId,
    //   status: "Pending",
    // });
    // if (existingPendingOrder) {
    //   return res.status(400).json({
    //     success: false,
    //     error:
    //       "Please complete the existing pending order before adding a new order.",
    //   });
    // }

    const session = await mongoose.startSession();
    session.startTransaction();
    let totalPrice = 0;

    try {
      for (const item of items) {
        const { shoeId, color: itemColor, size, quantity } = item;
        const {
          shoe,
          color: colorEntry,
          sizeEntry,
        } = await findAndValidateShoe(shoeId, itemColor, size, quantity);

        item.price = shoe.price;
        totalPrice += item.price * quantity;

        sizeEntry.quantity -= quantity;
        await shoe.save({ session });
      }

      const order = new Order({ user: userId, items });
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order,
        totalPrice,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (err) {
    console.error(err);
    let status = 500;
    if (
      err.message.includes("not found") ||
      err.message.includes("Insufficient")
    ) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

module.exports = {
  createOwnOrder,
  getOwnAllOrder,
  getAllOrder,
  getSingleOrder,
};
