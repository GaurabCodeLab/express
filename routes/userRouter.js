const express = require("express");
const userAuth = require("../middlewares/userAuth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const router = express.Router();

router.get("/requests/received", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const receivedConnectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "about"]);
    res.status(200).json({
      message: "connection requests fetched successfully",
      data: receivedConnectionRequests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in fetching received requests data: " + error.message,
    });
  }
});

router.get("/connections", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const connectionsDetails = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", ["firstName", "lastName", "about"])
      .populate("toUserId", ["firstName", "lastName", "about"]);
    const data = connectionsDetails.map((row) => {
      if (loggedInUser._id.toString() === row.fromUserId._id.toString()) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });
    res.status(200).json({
      message: "connections details fetched successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error in fetching connections details: " + error.message,
    });
  }
});

router.get("/feed", userAuth, async (req, res) => {
  try {
    let limitCount = parseInt(req.query.limit) || 10;
    limitCount = limitCount > 50 ? 50 : limitCount;
    const page = parseInt(req.query.page) || 1;
    const skipCount = (page - 1) * limitCount;
    const loggedInUser = req.user;
    const connectionsDetails = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select(["fromUserId", "toUserId"]);
    const hideUsers = new Set();
    connectionsDetails.forEach((conn) => {
      hideUsers.add(conn.fromUserId.toString());
      hideUsers.add(conn.toUserId.toString());
    });
    const feedUsers = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsers) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(["firstName", "lastName", "about"])
      .limit(limitCount)
      .skip(skipCount);
    res
      .status(200)
      .json({ message: "feed users fetched successfully", data: feedUsers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in fetching feed data: " + error.message });
  }
});

module.exports = { userRouter: router };
