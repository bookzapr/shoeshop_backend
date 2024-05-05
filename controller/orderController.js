const { Shoe, Color, Size } = require("../models/Shoe");

const { Order } = require("../models/Order");

const {
  findAndValidateShoe,
  findOrder,
} = require("../middleware/findMiddleware");
const { rejectOrder, acceptOrder } = require("../middleware/orderMiddleware");

const mongoose = require("mongoose");
const {
  STRIPE_SECRET,
  FRONTEND_URL,
  BACKEND_URL,
  STRIPE_WEBHOOK,
} = require("../util/var");

const stripe = require("stripe")(STRIPE_SECRET);

const getSingleOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await findOrder(orderId);

    if (!order || order.order.status == "Cancelled") {
      return res.status(404).json({
        success: false,
        message: "This Order doesn't exist anymore",
      });
    }

    // rejectOrder(order);

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

  if (status.toLowerCase() && status.toLowerCase()) {
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
      case "completed":
        query = "Completed";
        break;
      case "canceled":
        query = "Canceled";
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

const getEveryOrder = async (req, res) => {
  const { page = 1, length = 10, status } = req.query;

  let query = "";

  if (status.toLowerCase() && status.toLowerCase()) {
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
      case "completed":
        query = "Completed";
        break;
      case "canceled":
        query = "Canceled";
        break;
    }
  }

  const startIndex = (page - 1) * length;
  const limit = parseInt(length);

  try {
    let orders;
    if (query !== "") {
      orders = await Order.find({ status: query })
        .skip(startIndex)
        .limit(limit);
    } else {
      orders = await Order.find({}).skip(startIndex).limit(limit);
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

        (item.shoeModel = shoe.model),
          (item.shoeBrand = shoe.brand),
          (item.colorId = colorEntry._id);
        item.color = colorEntry.name;

        sizeEntry.quantity -= quantity;
        await shoe.save({ session });
      }

      const order = new Order({ user: userId, items });
      await order.save({ session });
      await session.commitTransaction();
      session.endSession();

      res.status(303).json({
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

const rejectOrderController = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await findOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await rejectOrder(order);

    return res.status(200).json({
      success: true,
      message: "Order has been rejected and cancelled",
      order: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to reject order due to internal server error",
      error: error.message,
    });
  }
};

const checkoutOwnOrder = async (req, res) => {
  try {
    // const lineItems = order

    const orderId = "663750400331caa252846d75";

    const order = await Order.findById(orderId);

    const lineItems = order.items.map((item) => {
      return {
        price_data: {
          currency: "thb",
          product_data: {
            name: `${item.shoeBrand} ${item.shoeModel}`,
            // description: item.description || "",
            images: [`${BACKEND_URL}/api/v1/images/${item.colorId}`],
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      customer_email: "vee.sorav@gmail.com",
      // payment_method_types: ["promptpay"],
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["TH"],
      },
      line_items: lineItems,
      mode: "payment",
      success_url: `${FRONTEND_URL}/order-failed`,
      cancel_url: `${FRONTEND_URL}/order-completed`,
      metadata: {
        orderId: orderId,
      },
    });

    // res.redirect(303, session.url);
    res.status(200).json({
      success: true,
      message: "Checkout Then Redirect Successfully",
      redirectUrl: session.url,
      order: order,
    });
  } catch (err) {
    console.error(err.message);

    // switch (err.type) {
    //   case 'StripeCardError':
    //     // A declined card error
    //     err.message; // => e.g. "Your card's expiration year is invalid."
    //     break;
    //   case 'StripeRateLimitError':
    //     // Too many requests made to the API too quickly
    //     break;
    //   case 'StripeInvalidRequestError':
    //     // Invalid parameters were supplied to Stripe's API
    //     break;
    //   case 'StripeAPIError':
    //     // An error occurred internally with Stripe's API
    //     break;
    //   case 'StripeConnectionError':
    //     // Some kind of error occurred during the HTTPS communication
    //     break;
    //   case 'StripeAuthenticationError':
    //     // You probably used an incorrect API key
    //     break;
    //   default:
    //     // Handle any other types of unexpected errors
    //     break;
    // }
  }
};

const orderWebHook = async (req, res) => {
  const event = req.body;
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: `Order Not Found with Id : ${orderId}`,
        });
      }

      console.log(order);

      acceptOrder(order);

      // status = pending
      // before == purchasedAt

      //accept order here
      // create receipt model
      // status = processing

      //reject order
      // status = canceled
      // loop again and release quantity from items in order
      // if size and quantity doesn't match just do nothing

      return res.status(200).json({ success: true, order });
    }
  } catch (error) {
    let status = 500;
    if (
      error.message.includes("not found") ||
      error.message.includes("Insufficient")
    ) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Webhook Error : " + error.message });
  }
};

const acceptOrderController = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await findOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await acceptOrder(order);

    return res.status(200).json({
      success: true,
      message: "Order has been successfully accepted",
      order: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to accept order due to internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createOwnOrder,
  getOwnAllOrder,
  getAllOrder,
  getSingleOrder,
  checkoutOwnOrder,
  orderWebHook,
  rejectOrderController,
  acceptOrderController,
  getEveryOrder,
};
