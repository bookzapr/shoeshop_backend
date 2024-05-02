const { Shoe, Color, Size } = require("../models/Shoe");
const Image = require("../models/Image");

const sharp = require("sharp");
const multer = require("multer");

const getAllShoes = async (req, res) => {
  try {
    const {
      page = 1,
      length = 10,
      brand,
      gender,
      type,
      color,
      minPrice,
      maxPrice,
      size,
    } = req.query;

    const startIndex = (page - 1) * length;
    const limit = parseInt(length);

    let query = {};

    if (brand) {
      query.brand = brand;
    }
    if (gender) {
      query.gender = gender;
    }
    if (type) {
      query.type = type;
    }
    if (color) {
      query["colors.name"] = { $regex: new RegExp(color, "i") }; // Case insensitive search
    }
    if (minPrice && maxPrice) {
      query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice) {
      query.price = { $gte: Number(minPrice) };
    } else if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
    }
    if (size) {
      query["colors.sizes.size"] = parseFloat(size);
    }

    const totalCount = await Shoe.countDocuments(query);
    const total_pages = Math.ceil(totalCount / length);

    const shoes = await Shoe.find(query).skip(startIndex).limit(limit).lean();

    shoes.forEach((shoe) => {
      shoe.total_quantity = shoe.colors.reduce(
        (acc, color) =>
          acc + color.sizes.reduce((acc, size) => acc + size.quantity, 0),
        0
      );
    });

    res.status(200).json({
      success: true,
      data: shoes,
      length: shoes.length,
      total_pages: total_pages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getColor = async (req, res) => {
  try {
    const { shoeId, colorId } = req.params;
    const shoe = await Shoe.findById(shoeId).lean();
    if (!shoe) {
      return res.status(404).json({ success: false, error: "Shoe not found" });
    }

    const color = shoe.colors.find((c) => c._id.toString() === colorId);
    if (!color) {
      return res.status(404).json({ success: false, error: "Color not found" });
    }

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
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getAllColors = async (req, res) => {
  try {
    const { shoeId } = req.params;
    const shoe = await Shoe.findById(shoeId).lean();

    if (!shoe) {
      return res.status(404).json({ success: false, error: "Shoe not found" });
    }

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
    res.status(500).json({ success: false, error: "Internal Server Error" });
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

    const shoe = await Shoe.findById(shoeId);
    if (!shoe) {
      return res.status(404).json({ success: false, error: "Shoe not found" });
    }

    const color = shoe.colors.id(colorId);
    if (!color) {
      return res.status(404).json({ success: false, error: "Color not found" });
    }

    color.name = name || color.name;
    color.hex = hex || color.hex;

    await shoe.save();

    res.status(200).json({
      success: true,
      data: shoe,
      message: "Color and sizes updated successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

const deleteColor = async (req, res) => {
  try {
    const { shoeId, colorId } = req.params;

    const shoe = await Shoe.findById(shoeId);
    if (!shoe) {
      return res.status(404).json({ success: false, error: "Shoe not found" });
    }

    const colorExists = shoe.colors.id(colorId);
    if (!colorExists) {
      return res.status(404).json({ success: false, error: "Color not found" });
    }

    shoe.colors.id(colorId).remove();
    await shoe.save();

    res.status(200).json({
      success: true,
      message: "Color deleted successfully",
      data: shoe,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const createShoe = async (req, res) => {
  try {
    const { brand, model, gender, price, type, description } = req.body;

    if (!brand || !price) {
      return res.status(400).json({
        success: false,
        error: "Brand and price are required",
      });
    }

    const existingShoe = await Shoe.findOne({ brand: brand, model: model });

    if (existingShoe) {
      return res.status(409).json({
        success: false,
        error: "A shoe with the same brand and model already exists",
      });
    }

    const shoe = new Shoe({
      brand,
      model,
      price,
      gender,
      type,
      description,
      colors: [],
    });

    await shoe.save();

    res.status(201).json({
      success: true,
      data: shoe,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal Server Error: " + err.message,
    });
  }
};

const deleteShoe = async (req, res) => {
  try {
    const { id } = req.params;
    const shoe = await Shoe.findById(id);

    if (!shoe) {
      return res.status(404).json({ success: false, error: "Shoe not found" });
    }

    await shoe.deleteOne();

    res.status(200).json({
      success: true,
      message: "Shoe deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const getSingleShoe = async (req, res) => {
  try {
    const shoe = await Shoe.findById(req.params.id);
    if (!shoe) {
      return res.status(404).json({ success: false, error: "Shoe not found" });
    }
    shoe.total_quantity = shoe.colors.reduce((acc, color) => {
      const colorQuantity = color.sizes.reduce(
        (acc, size) => acc + size.quantity,
        0
      );
      return acc + colorQuantity;
    }, 0);
    return res.status(200).json({ success: true, data: shoe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const updateShoe = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, description, price, gender, type } = req.body;

    const shoe = await Shoe.findById(id);

    if (!shoe) {
      return res.status(404).json({ success: false, error: "Shoe not found" });
    }

    shoe.brand = brand || shoe.brand;
    shoe.model = model || shoe.model;
    shoe.description = description || shoe.description;
    shoe.price = price || shoe.price;
    shoe.gender = gender || shoe.gender;
    shoe.type = type || shoe.type;

    await shoe.save();

    res.status(200).json({
      success: true,
      data: shoe,
      message: "Shoe updated successfully",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Internal Server Error: " + err.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await Shoe.aggregate([
      {
        $group: {
          _id: "$brand",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          brand: "$_id",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  getAllShoes,
  getSingleShoe,
  createShoe,
  addColor,
  deleteColor,
  updateColor,
  deleteShoe,
  updateShoe,
  getAllBrands,
  getColor,
  getAllColors,
};
