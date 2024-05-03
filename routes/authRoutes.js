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

router.post("/auth/users", createUser);
router.get("/auth/users", getAllUser);
router.get("/auth/users/:userId", getSingleUser);
router.delete("/auth/users/:userId", deleteUser);
router.get("/auth/users/:userId/toggle", toggleUserAdmin);
router.put("/auth/users/:userId", updateUser);
router.post("/auth/login", loginAuth);
router.get("/auth/", verifyAccessToken, authenticateAuth);

module.exports = { authRoute: router };
