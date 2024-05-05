const { Shoe, Color, Size } = require("../models/Shoe");

const { Order } = require("../models/Order");

const { Cart } = require("../models/Cart");

const addToCart = async (req, res) => {
  const userId = req.userId;
  const { shoeId, colorId, size, quantity } = req.body;

  if (!shoeId || !colorId || !size || !quantity) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: shoeId, colorId, size, or quantity",
    });
  }

  try {
    const shoe = await Shoe.findById(shoeId);
    if (!shoe) {
      return res
        .status(404)
        .json({ success: false, message: "Shoe not found" });
    }

    const color = shoe.colors.id(colorId);
    if (!color) {
      return res
        .status(404)
        .json({ success: false, message: "Color not found" });
    }

    const sizeEntry = color.sizes.find((s) => s.size === size);
    if (!sizeEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found" });
    }

    if (sizeEntry.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for item ${shoe.brand} ${shoe.model} ,color : ${color.name} ,size : ${size}`,
      });
    }

    sizeEntry.quantity -= quantity;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    let item = cart.items.find(
      (item) =>
        item.shoeId.equals(shoeId) &&
        item.colorId.equals(colorId) &&
        item.size === size
    );

    if (item) {
      item.quantity += quantity;
    } else {
      cart.items.push({
        shoeId: shoe._id,
        shoeModel: shoe.model,
        shoeBrand: shoe.brand,
        color: color.name,
        colorId: color._id,
        size: size,
        quantity: quantity,
        price: shoe.price,
      });
    }

    await cart.save();

    await shoe.save();

    res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const removeFromCart = async (req, res) => {
  const userId = req.userId;
  const { cartItemId } = req.params;

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item.id === cartItemId);
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    const itemToRemove = cart.items[itemIndex];

    const shoe = await Shoe.findById(itemToRemove.shoeId);
    if (!shoe) {
      return res
        .status(404)
        .json({ success: false, message: "Shoe not found" });
    }

    const color = shoe.colors.id(itemToRemove.colorId);
    if (!color) {
      return res
        .status(404)
        .json({ success: false, message: "Color not found" });
    }

    const sizeEntry = color.sizes.find((s) => s.size === itemToRemove.size);
    if (!sizeEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found" });
    }

    sizeEntry.quantity += itemToRemove.quantity;

    cart.items.splice(itemIndex, 1);

    await shoe.save();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateCart = async (req, res) => {
  const userId = req.userId;
  const { itemId } = req.params;
  const { newQuantity } = req.body;

  if (!newQuantity || newQuantity < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid quantity provided." });
  }

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    const item = cart.items[itemIndex];

    const shoe = await Shoe.findById(item.shoeId);
    if (!shoe) {
      return res
        .status(404)
        .json({ success: false, message: "Shoe not found" });
    }

    const color = shoe.colors.id(item.colorId);
    if (!color) {
      return res
        .status(404)
        .json({ success: false, message: "Color not found" });
    }

    const sizeEntry = color.sizes.find((s) => s.size === item.size);
    if (!sizeEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found" });
    }

    if (sizeEntry.quantity + item.quantity < newQuantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock available" });
    }

    sizeEntry.quantity += item.quantity - newQuantity;
    item.quantity = newQuantity;

    await shoe.save();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const checkoutCart = async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      shoeId: item.shoeId,
      shoeModel: item.shoeModel,
      shoeBrand: item.shoeBrand,
      color: item.color,
      colorId: item.colorId,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const newOrder = new Order({
      user: userId,
      items: orderItems,
    });

    await newOrder.save();

    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Checkout successful, order created",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getCarts = async (req, res) => {
  const userId = req.userId;

  try {
    const carts = await Cart.find({ user: userId }).populate(
      "items.shoeId",
      "brand model price"
    );

    if (!carts) {
      return res
        .status(404)
        .json({ success: false, message: "No carts found for this user." });
    }

    res.status(200).json({
      success: true,
      message: "Carts retrieved successfully.",
      carts: carts,
    });
  } catch (error) {
    console.error("Error retrieving carts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  checkoutCart,
  updateCart,
  removeFromCart,
  getCarts,
};
