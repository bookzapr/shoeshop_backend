const { Shoe, Color, Size } = require("../models/Shoe");
const Image = require("../models/Image");

const sharp = require("sharp");
const multer = require("multer");
const { findShoeColor } = require("../middleware/findMiddleware");

const getColor = async (req, res) => {
  try {
    const { shoeId, colorId } = req.params;
    const { shoe, color } = await findShoeColor(shoeId, colorId);

    color.total_quantity = color.sizes.reduce(
      (acc, size) => acc + size.quantity,
      0
    );

    res.status(200).json({
      success: true,
      data: color,
    });
  } catch (err) {
    console.error(err);
    let status = 500;
    if (err.message.includes("not found")) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

const getAllColors = async (req, res) => {
  try {
    const { shoeId, colorId } = req.params;
    const { shoe, color } = await findShoeColor(shoeId, colorId);

    const colorsWithQuantities = shoe.colors.map((color) => ({
      ...color,
      total_quantity: color.sizes.reduce((sum, size) => sum + size.quantity, 0),
    }));

    res.status(200).json({
      success: true,
      data: colorsWithQuantities,
    });
  } catch (err) {
    console.error(err);
    let status = 500;
    if (err.message.includes("not found")) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

const addColor = async (req, res) => {
  try {
    const { shoeId } = req.params;
    const { name, sizes, hex } = req.body;
    const shoe = await Shoe.findOne({ _id: shoeId });

    if (!shoe) {
      return res.status(404).json({
        success: false,
        error: "Shoe not found",
      });
    }

    for (let color of shoe.colors) {
      if (color.name.toUpperCase() === name.toUpperCase()) {
        return res.status(409).json({
          success: false,
          error: "This color already exists",
        });
      }
    }

    const buffer = req.file.buffer;
    const webpData = await sharp(buffer)
      .resize(1080)
      .webp({ quality: 100 })
      .toBuffer();

    const color = new Color({
      name,
      hex,
      sizes: JSON.parse(sizes),
    });

    shoe.colors.push(color);
    await shoe.save();

    const image = new Image({
      imageId: color._id,
      data: webpData,
      contentType: "image/webp",
    });

    await image.save();

    return res.status(200).json({
      success: true,
      data: shoe,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error: " + err.message,
    });
  }
};

const updateColor = async (req, res) => {
  try {
    const { shoeId, colorId } = req.params;
    const { name, hex } = req.body;
    const { shoe, color } = await findShoeColor(shoeId, colorId);

    console.log(name);

    color.name = name || color.name;
    color.hex = hex || color.hex;

    console.log(color.name, color.hex);

    await shoe.save();

    res.status(200).json({
      success: true,
      data: shoe,
      message: "Color and sizes updated successfully",
    });
  } catch (err) {
    console.error(err);
    let status = 500;
    if (err.message.includes("not found")) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

const deleteColor = async (req, res) => {
  try {
    const { shoeId, colorId } = req.params;

    const { shoe, color } = await findShoeColor(shoeId, colorId);

    shoe.colors.id(colorId).deleteOne();
    await shoe.save();

    res.status(200).json({
      success: true,
      message: "Color deleted successfully",
      data: shoe,
    });
  } catch (err) {
    console.error(err);
    let status = 500;
    if (err.message.includes("not found")) {
      status = 404;
    }
    res
      .status(status)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

module.exports = {
  addColor,
  deleteColor,
  updateColor,
  getColor,
  getAllColors,
};
