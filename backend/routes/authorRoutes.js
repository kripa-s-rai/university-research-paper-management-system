// routes/authors.js

const express = require("express");
const router = express.Router();
const AuthorController = require("../controllers/AuthorController");


// Get all authors
router.get("/", AuthorController.getAllAuthors);

module.exports = router;
