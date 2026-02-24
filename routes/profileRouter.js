const express = require("express");
const userAuth = require("../middlewares/userAuth");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

const router = express.Router();

router.get("/view", userAuth, async (req, res) => {
  const user = req.user;
  try {
    const userDetails = await User.findOne({ email: user.email });
    res.status(200).json({ message: "success", user: userDetails });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in getting user details: " + error });
  }
});

router.patch("/edit", userAuth, async (req, res) => {
  const user = req.user;
  const allowedFields = [
    "lastName",
    "about",
    "skills",
    "gender",
    "firstName",
    "age",
    "photoUrl",
  ];
  const isValidFields = Object.keys(req.body).every((value) =>
    allowedFields.includes(value),
  );
  if (!isValidFields) {
    return res.status(400).json({ message: "Invalid field data" });
  }
  try {
    const updates = {};
    for (let key of allowedFields) {
      if (req.body[key]) updates[key] = req.body[key];
    }
    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      { $set: updates },
      { new: true },
    ).select("-password");
    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in updating profile: " + error.message });
  }
});

router.post("/reset-password", userAuth, async (req, res) => {
  const user = req.user;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both new password and confirm password required" });
  }
  if (!validator.isStrongPassword(newPassword)) {
    return res.status(400).json({ message: "Provide strong password" });
  }
  try {
    const userDetails = await User.findOne({ email: user.email });
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      userDetails.password,
    );
    if (!isValidPassword) {
      return res.status(401).send({ message: "Incorrect current password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email: userDetails.email },
      { $set: { password: hashedPassword } },
      { new: true },
    );
    res.status(200).json({ message: "password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in updating password: " + error.message });
  }
});

module.exports = { profileRouter: router };
