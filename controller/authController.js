const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User } = require("../models/User");

const { ACCESS_TOKEN_SECRET } = require("../util/var");

const loginAuth = async (req, res) => {
  const { email, password } = req.body;

  //   const hashpass = await bcrypt.hash("admindada123", 10);

  //   await User.create({
  //     email: "dada@gmail.com",
  //     password: hashpass,
  //     isAdmin: true,
  //   });

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
        displayName: email.split("@")[0],
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
  const { email, password } = req.body;
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

const updateUser = async (req, res) => {
  const { email, newEmail, newPassword, newIsAdmin } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Current email must be provided",
    });
  }

  const updateData = {};
  if (newEmail) updateData.email = newEmail;
  if (newPassword) updateData.password = newPassword;
  if (newIsAdmin !== undefined) updateData.isAdmin = newIsAdmin;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
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

module.exports = {
  loginAuth,
  authenticateAuth,
  createUser,
  updateUser,
};
