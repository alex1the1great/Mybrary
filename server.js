// Check If not in production
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");

// Express Init
const app = express();

// Template Engine Setup
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Express EJS Layouts
app.set("layout", "layouts/layout");
app.use(expressLayouts);

// Static Folder
app.use(express.static("public"));

// Express BodyParser
app.use(express.urlencoded({ limit: "10mb", extended: false }));

// MongoDB Config
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", error => console.error(error));
db.once("open", () => console.log("Connected to Mongoose..."));

// Require Routes
const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors");

// Use Routes
app.use("/", indexRouter);
app.use("/authors", authorRouter);

// PORT & Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at port ${PORT}...`));
