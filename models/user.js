const mongoose = require("mongoose");
const validator = require("validator");

const { Schema, models, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 30,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Provide valid email address",
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBvqzyx_zoi6q2c0Gd1XnE7wysD9PGOLe3-A&s",
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 99,
    },
    about: {
      type: String,
      default: "This is default about message",
    },
    skills: {
      type: [String],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
  },
  { timestamps: true },
);

const User = models.User || model("User", userSchema);

module.exports = User;
