const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.use(express.json());

router.post("/signup", async (req, res) => {
  const newUserDetails = req.body;
  const userSchemaFields = [
    "firstName",
    "lastName",
    "email",
    "password",
    "about",
    "skills",
    "gender",
  ];
  const isValidBody = Object.keys(newUserDetails).every((value) =>
    userSchemaFields.includes(value),
  );
  if (!isValidBody) {
    return res.status(400).send("Invalid request data");
  }

  const isValidPasssword = validator.isStrongPassword(newUserDetails.password);
  if (!isValidPasssword) {
    return res.status(400).send("Provide strong password");
  }

  try {
    const hashedPassword = await bcrypt.hash(newUserDetails.password, 10);
    const user = await User.create({
      ...newUserDetails,
      password: hashedPassword,
    });
    res.status(201).json({ message: "success", user });
  } catch (error) {
    res.status(500).send("Error in creating user : " + error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if ((!email, !password)) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, "Raja1634@", {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    res.status(200).json({ message: "login successful", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error in login : " + error.message });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).send("logout successfull");
});

module.exports = { authRouter: router };
