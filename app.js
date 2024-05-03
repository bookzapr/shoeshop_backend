const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const Image = require("./models/Image.js");
const app = express();
const { routeNotFound } = require("./middleware/routeNotFound.js");
const { shoeRoute } = require("./routes/shoeRoute");
const { authRoute } = require("./routes/authRoutes.js");
const { colorRoute } = require("./routes/colorRoute.js");
const { sizeRoute } = require("./routes/sizeRoute.js");
const { orderRoute } = require("./routes/orderRoute.js");

app.use(bodyParser.json());

app.use(cors());

app.use("/api/v1", shoeRoute);
app.use("/api/v1", colorRoute);
app.use("/api/v1", sizeRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", authRoute);

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

app.get("/health-check", (req, res) => {
  res.send("Everything is working fine");
});

app.use(routeNotFound);

module.exports = app;
