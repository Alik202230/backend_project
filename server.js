require("dotenv").config()
const express = require("express");
const app = express();
const { logger } = require("./middleware/logger")
const errorHandler = require("./middleware/errorHandler")
const cookieParser = require("cookie-parser")
const cors = require("cors");
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/dbConnection")
const mongoose = require("mongoose")
const { logEvents } = require("./middleware/logger")
const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json());

app.use(cookieParser())


app.use("/auth", require("./routes/authRoutes"))
app.use("/users", require("./routes/userRoutes"))
app.use("/notes", require("./routes/noteRoutes"))

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
})

mongoose.connection.on("error", err => {
  console.log(err)
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
})

