const express = require("express");
const Book = require("../models/book");
const jsonSchema = require("jsonschema")
const validateBookSchema = require("../schemas/validate_book")
const ExpressError = require("../expressError")
const router = new express.Router();

// Initialize cacheing
const NodeCache = require("node-cache")
const myCache = new NodeCache({stdTTL:86400})

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const value = myCache.get('/')
    if (value) {
      return res.json({value})
    } else {
      const books = await Book.findAll(req.query);
      // cache books results
      const result = myCache.set('/', books, 43200)
      return res.json({ books });
    }
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    // if value in cache return value
    const value = myCache.get(`/${req.params.id}`)
    if (value) {
      return res.json({value})
    } else {
      const book = await Book.findOne(req.params.id);
      // cache book object
      const result = myCache.set(`/${req.params.id}`, book, 43200 )
      return res.json({ book });
    }
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    // Validate book JSON
    const results = jsonSchema.validate(req.body, validateBookSchema)
    
    if (!results.valid) {
      // if results invalid, throw new error
      let listOfErrors = results.errors.map(error => error.stack)
      let error = new ExpressError(listOfErrors, 400)
      return next(error)
    }
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const results = jsonSchema.validate(req.body, validateBookSchema)
    if (!results.valid) {
      // if results invalid, throw new error
      let listOfErrors = results.errors.map(error => error.stack)
      let error = new ExpressError(listOfErrors, 400)
      return next(error)
    }
    
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
