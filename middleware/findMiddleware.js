const { Shoe, Color, Size } = require("../models/Shoe");

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

module.exports = {
  findShoeColorSize,
  findShoeColor,
  findShoe,
};
