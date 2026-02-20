require("dotenv").config();
const mongoose = require("mongoose");

const dbConnect = async () => {
  await mongoose.connect(process.env.MONGO_DB_URI);
};

module.exports = dbConnect;
