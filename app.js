const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dbConnect = require("./config/database");
const { authRouter } = require("./routes/authRouter");
const { profileRouter } = require("./routes/profileRouter");
const { requestRouter } = require("./routes/request");
const { userRouter } = require("./routes/userRouter");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);

dbConnect()
  .then(() => {
    console.log("Database connected");
    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  })
  .catch((error) => {
    console.log("Error in connecting Database : " + error);
  });
