const express = require("express");
const router = express.Router();

// @type  - GET
// @route - /
// @desc  - Display index page
router.get("/", (req, res) => {
  res.render("index");
});

module.exports = router;
