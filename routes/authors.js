const express = require("express");
const router = express.Router();

// Author Model
const Author = require("../models/author");

// @type  - GET
// @route - /authors
// @desc  - Display All Author Page
router.get("/", async (req, res) => {
  let searchOptions = {};

  // Check if query.name is not null & empty
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors,
      searchOptions: req.query
    });
  } catch {
    res.redirect("/");
  }
});

// @type  - GET
// @route - /authors/new
// @desc  - Display New Author Page
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// @type  - GET
// @route - /authors
// @desc  - Create New Author
router.post("/", async (req, res) => {
  // Assign new author with Author Model
  const author = new Author({
    name: req.body.name
  });

  try {
    const newAuthor = await author.save();
    // res.redirect(`authors/${newAuthor.id}`);
    res.redirect("authors");
  } catch {
    res.render("authors/new", {
      author,
      errorMessage: "Error Creating Author"
    });
  }
});

module.exports = router;
