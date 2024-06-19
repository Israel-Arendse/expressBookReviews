const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Registers Public users to the bookshop
public_users.post("/register", (req,res) => {

// The user must provide a username and a password
  const username = req.body.username;
  const password = req.body.password;

  if(username&&password){
    if(!doesExists(username)){
      users.push({"username":username, "password":password});
      return res.status(200).json({message: "User successfully registered. Now you can log in"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }

  // Checks if the user with the username already exist
  const doesExist = (username)=>{
    let userwithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userwithsamename.length > 0){  
      return true;
    } else{
      return false;
    }
  }

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  
  //Returns the book list in stringified JSON format
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Convert the books object to an array of book objects
  const booksArray = Object.values(books);

  // Find the book with the matching ISBN
  const book = booksArray.find(book => book.isbn === isbn);
  
  if (book) {
    res.send(book);
  } else {
    res.send({ message:"Book does not exist"});
  }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = decodeURIComponent(req.params.author);

  // Converts the book object to an array of book objects
  // to access author property
  const booksArray = Object.values(books);
  
  // Find the book with the matching author
  const book = booksArray.find(book => book.author === author);

  if (book){
    res.send(book);
  } else {
    res.send({ message: "Author not listed"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = decodeURIComponent (req.params.title);

  // Converts the book object to an array of book objects
  // to access author property
  const booksArray = Object.values(books);

 // Finds the book with the matching title
 const book = booksArray.find(book => book.title === title);

  if(book){
    res.send(book);
  } else {
    res.send({message: "Title not found"});
  }

});  
  
//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = decodeURIComponent(req.params.isbn);

  // Convert the books object to an array of book objects
  const booksArray = Object.values(books);

  // Find the book with the matching ISBN
  const book = booksArray.find(book => books.isbn === isbn);

  if (book) {
    if (book.reviews && book.reviews.length > 0) {
      res.send({ reviews: book.reviews });
    } else {
      res.send({ message: "Please add a review" });
    }
  } else {
    res.send({ message: "Book does not exist" });
  }
});

module.exports.general = public_users;
