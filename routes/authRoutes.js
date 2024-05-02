const express = require("express");
const {
  loginAuth,
  authenticateAuth,
  createUser,
  updateUser,
  toggleUserAdmin,
  getAllUser,
  getSingleUser,
  deleteUser,
} = require("../controller/authController");
const { verifyAccessToken } = require("../middleware/verifyAccessToken");

const router = express.Router();

router.post("/users", createUser);
router.get("/users", getAllUser);
router.get("/users/:userId", getSingleUser);
router.delete("/users/:userId", deleteUser);
router.get("/users/:userId/toggle", toggleUserAdmin);
router.put("/users/:userId", updateUser);
router.post("/login", loginAuth);
router.get("/", verifyAccessToken, authenticateAuth);

module.exports = { authRoute: router };
