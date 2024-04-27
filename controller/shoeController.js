const { Shoe, Color } = require("../models/Shoe");
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
      colorName,
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

    if (colorName) {
      query["colors.name"] = colorName;
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

    const shoes = await Shoe.find(query).skip(startIndex).limit(limit).lean();

    if (colorName || size) {
      shoes.forEach((shoe) => {
        shoe.colors = shoe.colors.filter((color) => {
          return (
            (!colorName || color.name === colorName) &&
            (!size || color.sizes.some((s) => s.size === parseFloat(size)))
          );
        });
      });
    }

    res.status(200).json({
      success: true,
      data: shoes,
      length: shoes.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// const addColor = async (req, res) => {
//   try {
//     const { shoeId } = req.params;
//     const { name, sizes, hex } = req.body;
//     const shoe = await Shoe.findOne({ _id: shoeId });

//     if (!shoe) {
//       return res.status(404).json({
//         success: false,
//         error: "Shoe not found",
//       });
//     }

//     for (let color of shoe.colors) {
//       if (color.name.toUpperCase() === name.toUpperCase()) {
//         return res.status(409).json({
//           success: false,
//           error: "This color already exists",
//         });
//       }
//     }

//     const buffer = req.file.buffer;
//     const webpData = await sharp(buffer)
//       .resize(1080)
//       .webp({ quality: 100 })
//       .toBuffer();

//     const color = {
//       name,
//       image: {
//         data: webpData,
//         contentType: "image/webp",
//       },
//       hex,
//       sizes: JSON.parse(sizes),
//     };

//     if (!shoe.colors) {
//       shoe.colors = [];
//     }

//     shoe.colors.push(color);
//     await shoe.save();

//     return res.status(200).json({
//       success: true,
//       data: shoe,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       error: "Internal Server Error: " + err.message,
//     });
//   }
// };

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
    const { brand, model, gender, price, type } = req.body;

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
};
