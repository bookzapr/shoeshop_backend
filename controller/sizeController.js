const { Shoe, Color, Size } = require("../models/Shoe");

const {
  findShoeColor,
  findShoeColorSize,
} = require("../middleware/findMiddleware");

const getAllSize = async (req, res) => {
  try {
    const { shoeId, colorId } = req.params;
    const { shoe, color } = await findShoeColor(shoeId, colorId);

    if (!color.sizes || color.sizes.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "No sizes found for this color." });
    }

    const sizesWithQuantities = color.sizes.map((size) => ({
      sizeId: size._id,
      size: size.size,
      quantity: size.quantity,
    }));

    res.status(200).json({
      success: true,
      data: sizesWithQuantities,
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

const getSize = async (req, res) => {
  try {
    const { shoeId, colorId, sizeId } = req.params;
    const { shoe, color, size } = await findShoeColorSize(
      shoeId,
      colorId,
      sizeId
    );

    const foundSize = color.sizes.find((s) => s._id.toString() === sizeId);

    res.status(200).json({
      success: true,
      data: foundSize,
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

const updateSize = async (req, res) => {
  try {
    const { shoeId, colorId, sizeId } = req.params;
    const newSizeData = req.body;
    const { shoe, color, size } = await findShoeColorSize(
      shoeId,
      colorId,
      sizeId
    );

    if (!newSizeData.size || ![0, 0.5].includes(newSizeData.size % 1)) {
      return res.status(400).json({
        success: false,
        error: "Size must be a number ending in .0 or .5",
      });
    }

    const isDuplicate = color.sizes.some(
      (s) => s.size === newSizeData.size && s._id.toString() !== sizeId
    );
    if (isDuplicate) {
      return res
        .status(409)
        .json({ success: false, error: "Size already exists in this color" });
    }

    size.size = newSizeData.size;
    size.quantity = newSizeData.quantity;

    await shoe.save();

    res.status(200).json({
      success: true,
      message: "Size updated successfully",
      data: size,
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

const deleteSize = async (req, res) => {
  try {
    const { shoeId, colorId, sizeId } = req.params;
    const newSizeData = req.body;
    const { shoe, color, size } = await findShoeColorSize(
      shoeId,
      colorId,
      sizeId
    );

    size.deleteOne();
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

const createSize = async (req, res) => {
  try {
    const { shoeId, colorId } = req.params;
    const newSizeData = req.body;
    const { shoe, color, size } = await findShoeColor(shoeId, colorId);

    if (!newSizeData.size || ![0, 0.5].includes(newSizeData.size % 1)) {
      return res.status(400).json({
        success: false,
        error: "Size must be a number ending in .0 or .5",
      });
    }

    const isDuplicate = color.sizes.some((s) => s.size === newSizeData.size);
    if (isDuplicate) {
      return res
        .status(409)
        .json({ success: false, error: "Size already exists in this color" });
    }
    color.sizes.push(
      new Size({ size: newSizeData.size, quantity: newSizeData.quantity })
    );

    await shoe.save();

    res.status(201).json({
      success: true,
      message: "Size created successfully",
      data: color.sizes[color.sizes.length - 1],
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
  getAllSize,
  getSize,
  updateSize,
  deleteSize,
  createSize,
};
