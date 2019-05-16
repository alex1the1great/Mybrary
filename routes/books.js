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

// @type  - POST
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
    res.redirect(`books/${newBook.id}`);
  } catch {
    renderNewPage(res, book, true);
  }
});

// @type  - GET
// @route - /books/:id
// @desc  - Display Single Book
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("author")
      .exec();
    res.render("books/show", { book });
  } catch {
    res.redirect("/");
  }
});

// @type  - GET
// @route - /books/:id/edit
// @desc  - Display Edit Book Page
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});

// @type  - PUT
// @route - /books/:id
// @desc  - Edit  Book
router.put("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;

    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (err) {
    console.log(err);
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      res.redirect("/");
    }
  }
});

// @type  - DELETE
// @route - /books/:id
// @desc  - Delet Book
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.remove();
    res.redirect("/books");
  } catch {
    if (book != null) {
      res.render("books/show", {
        book,
        errorMessage: "Could not remove book"
      });
    } else {
      res.redirect("/");
    }
  }
});

// renderNewPage Function
async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}
// renderEditPage Function
async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

// renderFormPage Function
async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors,
      book
    };

    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error Updating Book";
      } else {
        params.errorMessage = "Error Creating Book";
      }
    }

    res.render(`books/${form}`, params);
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
