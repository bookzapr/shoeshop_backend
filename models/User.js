const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  displayName: { type: String, default: "Anonymous" },
  address: {
    line1: {
      type: String,
    },
    city: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    country: {
      type: String,
      default: "TH",
    },
  },
});

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
