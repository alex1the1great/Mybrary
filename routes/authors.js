const express = require("express");
const router = express.Router();

//  Model
const Author = require("../models/author");
const Book = require("../models/book");

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

// @type  - POST
// @route - /authors
// @desc  - Create New Author
router.post("/", async (req, res) => {
  // Assign new author with Author Model
  const author = new Author({
    name: req.body.name
  });

  try {
    const newAuthor = await author.save();
    res.redirect(`authors/${newAuthor.id}`);
  } catch {
    res.render("authors/new", {
      author,
      errorMessage: "Error Creating Author"
    });
  }
});

// @type  - GET
// @route - /authors/:id
// @desc  - Display Single Author
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id })
      .limit(6)
      .exec();
    res.render("authors/show", {
      booksByAuthor: books,
      author
    });
  } catch {
    res.redirect("/");
  }
});

// @type  - GET
// @route - /authors/:id/edit
// @desc  - Display Edit Author Page
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author });
  } catch {
    res.redirect("/authors");
  }
});

// @type  - PUT
// @route - /authors/:id
// @desc  -  Edit Single Author
router.put("/:id", async (req, res) => {
  let author;

  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == nul) {
      res.redirect("/");
    } else {
      res.render("authors/edit", {
        author,
        errorMessage: "Error Updating Author"
      });
    }
  }
});

// @type  - DELETE
// @route - /authors/:id
// @desc  - Delete Author
router.delete("/:id", async (req, res) => {
  let author;

  try {
    author = await Author.findById(req.params.id);
    await author.remove();
    res.redirect("/authors");
  } catch {
    if (author == null) {
      res.redirect("/");
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

module.exports = router;
