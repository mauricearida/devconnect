const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");

const dotenv = require("dotenv");
dotenv.config();
const usersRoute = require("./routes/api/Users");
const profile = require("./routes/api/Profile");
const posts = require("./routes/api/Posts");
const cors = require("cors");

//DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());

//Passport middleware
app.use(passport.initialize());

//Passport Config
require("./config/passport")(passport);

// User Routes
app.use("/api/users", usersRoute);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
