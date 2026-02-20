const mongoose = require("mongoose");

const { models, model, Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: `{VALUE} is not correct status`,
      },
    },
  },
  { timestamps: true }
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

const ConnectionRequest =
  models.ConnectionRequest ||
  model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequest;
