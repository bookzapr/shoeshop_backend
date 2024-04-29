const express = require("express");
const {
  loginAuth,
  authenticateAuth,
  createUser,
  updateUser,
} = require("../controller/authController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

router.post("/users", createUser);
router.post("/login", loginAuth);
router.get("/", verifyAccessToken, authenticateAuth);

module.exports = { authRoute: router };
