const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Image = require("./models/Image.js");
const app = express();
const sharp = require("sharp");

const { routeNotFound } = require("./middleware/routeNotFound.js");
const { shoeRoute } = require("./routes/shoeRoute");
const { authRoute } = require("./routes/authRoutes.js");
const { colorRoute } = require("./routes/colorRoute.js");
const { sizeRoute } = require("./routes/sizeRoute.js");
const { orderRoute } = require("./routes/orderRoute.js");
const { cartRoute } = require("./routes/cartRoute.js");

app.use(bodyParser.json());

app.use(cors());

app.use("/api/v1", shoeRoute);
app.use("/api/v1", colorRoute);
app.use("/api/v1", sizeRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", authRoute);
app.use("/api/v1", cartRoute);

app.get("/api/v1/images/:imageId", async (req, res) => {
  try {
    const image = await Image.findOne({ imageId: req.params.imageId });
    if (!image) {
      return res.status(404).send("Image not found");
    }
    res.contentType(image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// app.post("/api/v1/images/:imageId", async (req, res) => {
//   try {
//     const { imageId } = req.params;
//     let image = await Image.findOne({ imageId: imageId });
//     if (!image) {
//       image = new Image({ name: imageId });
//     }

//     sharp(req.file.buffer)
//       .resize(1080)
//       .webp({ quality: 100 })
//       .toBuffer()
//       .then(async (webpData) => {
//         image.data = webpData;
//         image.contentType = "image/webp";

//         await image.save();
//         res.json({
//           success: true,
//           message: "Image uploaded successfully!",
//         });
//       })
//       .catch((error) => {
//         console.error(error);
//         let status = 500;
//         if (err.message.includes("not found")) {
//           status = 404;
//         }
//         res.status(status).json({
//           success: false,
//           error: "Internal Server Error: " + error.message,
//         });
//       });
//   } catch (error) {
//     console.error(error);
//     let status = 500;
//     if (err.message.includes("not found")) {
//       status = 404;
//     }
//     res.status(status).json({
//       success: false,
//       error: "Internal Server Error: " + error.message,
//     });
//   }
// });

app.get("/health-check", (req, res) => {
  res.send("Everything is working fine");
});

app.use(routeNotFound);

app.use((err, req, res, next) => {
  console.error(err.stack);

  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Internal Server Error";

  res.status(errorStatus).json({
    success: false,
    error: errorMessage,
  });
});


module.exports = app;
