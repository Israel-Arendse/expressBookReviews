const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
const axios = require('axios');
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (users.hasOwnProperty(username)) {
    return res.status(400).json({ message: "Username already exists." });
  }
  users.push({ username, password });
  console.log('users:', users);
  return res.status(200).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  })
    .then((bookList) => {
      res.status(200).json(bookList);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error retrieving book list." });
    });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found.");
    }
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const booksByAuthor = bookKeys
      .map(key => books[key])
      .filter(book => book.author.toLowerCase() === author);
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("Books by this author not found.");
    }
  })
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const booksWithTitle = bookKeys
      .map(key => books[key])
      .filter(book => book.title.toLowerCase() === title);
    if (booksWithTitle.length > 0) {
      resolve(booksWithTitle);
    } else {
      reject("Books with this title not found.");
    }
  })
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  if (!book.reviews) {
    return res.status(404).json({ message: "Reviews not found for this book." });
  }
  return res.status(200).json({ reviews: book.reviews });
});


// Get all books with axios
public_users.get('/async-books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:3000/');
    const bookList = response.data;
    res.status(200).json(bookList);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving book list." });
  }
});

// Get book details based on ISBN with axios
public_users.get('/async-isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:3000/isbn/${isbn}`);
    const book = response.data;
    res.status(200).json(book);
  } catch (error) {
    res.status(404).json({ message: "Book not found." });
  }
});

// Get book details based on author with axios
public_users.get('/async-author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:3000/author/${author}`);
    const books = response.data;
    res.status(200).json(books);
  } catch (error) {
    res.status(404).json({ message: "Books by this author not found." });
  }
});

// Get all books based on title with axios
public_users.get('/async-title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:3000/title/${title}`);
    const books = response.data;
    res.status(200).json(books);
  } catch (error) {
    res.status(404).json({ message: "Books with this title not found." });
  }
});

module.exports.general = public_users;
