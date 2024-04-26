const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Color",
  },
  data: Buffer,
  contentType: String,
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
