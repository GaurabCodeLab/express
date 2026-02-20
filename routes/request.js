const express = require("express");
const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequest");
const userAuth = require("../middlewares/userAuth");

const router = express.Router();

router.post("/send/:status/:id", userAuth, async (req, res) => {
  try {
    const { status, id } = req.params;
    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: `${status} is invalid status` });
    }
    const toUserDetails = await User.findById(id);
    if (!toUserDetails) {
      return res.status(400).json({ message: "user not found" });
    }
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send request to yourself" });
    }
    const fromUserId = req.user._id;
    const toUserId = id;
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      return res
        .status(400)
        .json({ message: "connection request already exist" });
    }
    const connectionRequestDetails = await ConnectionRequest.create({
      fromUserId,
      toUserId,
      status,
    });
    res.status(201).json({
      message:
        status === "interested"
          ? `${req.user.firstName} sent connection request to ${toUserDetails.firstName}`
          : `${req.user.firstName} rejected ${toUserDetails.firstName}`,
      connectionRequestDetails,
    });
  } catch (error) {
    res
      .status(500)
      .send("Error in sending connection request: " + error.message);
  }
});

router.post("/review/:status/:requestId", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const { status, requestId } = req.params;
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const existingConnectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      status: "interested",
      toUserId: loggedInUser._id,
    });
    if (!existingConnectionRequest) {
      return res.status(404).json({ message: "connection request not found" });
    }
    existingConnectionRequest.status = status;
    await existingConnectionRequest.save();
    res
      .status(200)
      .json({ message: `connection request ${status} successfully` });
  } catch (error) {
    res.status(500).json({
      message: "Error in reviewing connection request: " + error.message,
    });
  }
});

module.exports = { requestRouter: router };
