const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(404).json({ message: "Token is missing" });
  }
  try {
    const decodedObj = jwt.verify(token, "Raja1634@");
    if (!decodedObj) {
      return res.status(401).json({ message: "Token is invalid or expired" });
    }
    const userDetails = await User.findById(decodedObj.id);
    req.user = userDetails;
    next();
  } catch (error) {
    res.status(500).json({ message: "Error in validating user: " + error });
  }
};

module.exports = userAuth;
