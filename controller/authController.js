const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/User");

const { ACCESS_TOKEN_SECRET } = require("../util/var");

const loginAuth = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(404).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const foundUser = await User.findOne({ email: email }).exec();
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "Email doesn't match",
      });
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Password doesn't match",
      });
    }

    const userData = {
      email: foundUser.email,
      userId: foundUser._id,
      isAdmin: foundUser.isAdmin,
    };

    const access_token = jwt.sign(userData, ACCESS_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    foundUser.access_token = access_token;
    await foundUser.save();

    return res.status(200).json({
      success: true,
      data: {
        access_token: access_token,
        userId: foundUser._id,
        email: foundUser.email,
        isAdmin: foundUser.isAdmin,
        displayName: email.split("@")[0] || email,
      },
      message: "Login successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Can't login right now, Please contract admin ${error.message}`,
    });
  }
};

const createUser = async (req, res) => {
  const { email, password, displayName } = req.body;
  console.log(email);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password must be provided",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email: email,
      password: hashedPassword,
      isAdmin: false,
      displayName: email.split("@")[0] || email,
    });

    const savedUser = await newUser.save();
    res.status(201).json({
      success: true,
      data: savedUser,
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user: " + error.message,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await User.find({});

    console.log(users);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user: " + error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { newEmail, newPassword } = req.body;

  if (!newEmail && !newPassword) {
    res.status(404).json({
      success: false,
      message: "Email or password are required",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const updateData = {};
  if (newEmail) {
    updateData.email = newEmail;
    updateData.displayName = newEmail.split("@")[0] || newEmail;
  }
  if (newPassword) updateData.password = hashedPassword;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user: " + error.message,
    });
  }
};

const toggleUserAdmin = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User admin status toggled to ${user.isAdmin}`,
      data: {
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle user admin status: " + error.message,
    });
  }
};

const authenticateAuth = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the protected route!",
    data: {
      userId: req.userId,
      email: req.email,
      isAdmin: req.isAdmin,
    },
  });
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user: " + error.message,
    });
  }
};

const getSingleUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        email: user.email,
      },
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user: " + error.message,
    });
  }
};

module.exports = {
  loginAuth,
  authenticateAuth,
  createUser,
  updateUser,
  toggleUserAdmin,
  getAllUser,
  deleteUser,
  getSingleUser,
};
