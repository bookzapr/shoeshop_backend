const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema({
  size: {
    type: Number,
    required: false,
  },
  quantity: {
    type: Number,
    required: false,
    default: 10,
  },
});

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hex: {
    type: String,
    required: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  sizes: [sizeSchema],
});

const shoeSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: false,
    default: "Male",
  },
  type: {
    type: String,
    enum: ["Work", "Running", "Trail", "Basketball", "Casual", "Sandals"],
    required: false,
    default: "Casual",
  },
  is_active: {
    type: Boolean,
  },
  colors: [colorSchema],
  price: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Shoe = mongoose.model("Shoe", shoeSchema);

module.exports = Shoe;
