const express = require("express");
const router = express.Router();

//  Model
const Author = require("../models/author");
const Book = require("../models/book");

const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];

// @type  - GET
// @route - /books
// @desc  - Display All Books
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title !== "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore !== "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter !== "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }

  try {
    const books = await query.exec();
    res.render("books/index", {
      books,
      searchOptions: req.query
    });
  } catch {
    res.redirect("/");
  }
});

// @type  - GET
// @route - /books/new
// @desc  - Display New Book Page
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// @type  - GET
// @route - /books
// @desc  - Create New Book
router.post("/", async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`);
    res.redirect("books");
  } catch {
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors,
      book
    };
    if (hasError) params.errorMessage = "Error Creating Book";

    res.render("books/new", params);
  } catch {
    res.redirect("books");
  }
}

// saveCover Function
function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;

  const cover = JSON.parse(coverEncoded);

  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
