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

    const shoes = await Shoe.find(query).skip(startIndex).limit(limit);

    shoes.map((shoe) => {
      shoe.colors = shoe.colors[0];
    });

    console.log(shoes);

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

const createShoe = async (req, res) => {
  try {
    const { brand, model, gender, price } = req.body;

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

const getSingleShoe = async (req, res) => {
  try {
    const shoe = await Shoe.findById(req.params.id);
    if (!shoe) {
      return res.status(404).json({ success: false, error: "Shoe not found" });
    }
    res.status(200).json({ success: true, data: shoe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = {
  getAllShoes,
  getSingleShoe,
  createShoe,
  addColor,
};
