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
    imageUrl: {
      type: String,
    },
    password: {
      type: String,
      required: true,
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
  { timestamps: true }
);

const User = models.User || model("User", userSchema);

module.exports = User;
