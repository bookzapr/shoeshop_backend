const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  shoeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shoe",
    required: true,
  },
  shoeModel: {
    type: String,
    required: true,
  },
  shoeBrand: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Color",
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipping", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = {
  Order,
};
