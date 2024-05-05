const { Shoe, Color, Size } = require("../models/Shoe");

const mongoose = require("mongoose");

const { Order } = require("../models/Order");

async function findShoeColorSize(shoeId, colorId, sizeId) {
  const shoe = await Shoe.findById(shoeId);
  if (!shoe) throw new Error("Shoe not found");

  const color = shoe.colors.id(colorId);
  if (!color) throw new Error("Color not found");

  const size = color.sizes.id(sizeId);
  if (!size) throw new Error("Size not found");

  return { shoe, color, size };
}

async function findShoeColor(shoeId, colorId) {
  const shoe = await Shoe.findById(shoeId);
  if (!shoe) throw new Error("Shoe not found");

  const color = shoe.colors.id(colorId);
  if (!color) throw new Error("Color not found");

  return { shoe, color };
}

async function findShoe(shoeId) {
  const shoe = await Shoe.findById(shoeId);
  if (!shoe) throw new Error("Shoe not found");

  return { shoe };
}

async function findOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  return { order };
}

async function findAndValidateShoe(shoeId, colorId, size, quantity) {
  const shoe = await Shoe.findById(shoeId);
  if (!shoe) throw new Error("Shoe not found");

  const color = shoe.colors.find((c) => c._id == colorId);
  if (!color) throw new Error("Color not found");

  const sizeEntry = color.sizes.find((s) => s.size === size);

  if (!sizeEntry) {
    throw new Error("Insufficient size");
  }

  if (sizeEntry.quantity < quantity) {
    throw new Error("Insufficient stock");
  }

  return { shoe, color, sizeEntry };
}

async function findShoeForOrder(shoeId, colorId, size, quantity) {
  const shoe = await Shoe.findById(shoeId);
  if (!shoe) throw new Error("Shoe not found");

  const color = shoe.colors.id(colorId);
  if (!color) throw new Error("Color not found");

  const sizeEntry = color.sizes.find((s) => s.size === size);

  return { shoeEntry: shoe, colorEntry: color, sizeEntry, quantity };
}

module.exports = {
  findShoeColorSize,
  findShoeColor,
  findShoe,
  findAndValidateShoe,
  findShoeForOrder,
  findOrder,
};
