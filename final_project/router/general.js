const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Registers Public users to the bookshop
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Checks if the user with the username already exists
  const doesExist = (username)=>{
    let userwithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userwithsamename.length > 0){  
      return true;
    } else{
      return false;
    }
  };

 if(!username&&!password){
    return res.status(200).json({message: "Username and password are required"}); //Returns a message if username and password are required
  } else if (!username) {
    return res.status(400).json({message: "Username is required"}); //Returns a message if username is required 
  } else if (!password) {
    return res.status(400).json({ message: "Password is required"}); //Returns a message if password is required
  } else if (!isValid(username)){
    return res.status(400).json({message: "Username must be at least 6 characters long and contain both letters & numbers"}); //Returns a message if username is invalid
  } else if (!doesExist(username)){                                                                                            
    users.push({username: username, password: password});
    return res.status(200).json({message: "User successfully registered. Now you can log in"}); //Returns a message if user is successfully registered
  } else if (doesExist(username)) {
    return res.status(400).json({message: "User already exists"}); //Returns a message if user already exists
  } else {
    return res.status(400).json({message: "Unable to register user"}); //Returns a message if the code is unable to register user
  }
});  


async function fetchBooks(){
  return Promise.resolve(books);
};


// Get the book list available in the shop
public_users.get("/", async function (req, res) {
    try{
      const books = await fetchBooks();
      res.status(200).json(books);   
    } catch (error) {
      console.error('Error getting list of books ', error);
      res.status(500).json({ error: 'Internal server error'});
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
   const isbn = req.params.isbn;
   console.log(`Getting book details based on the ISBN: ${isbn}...`);
 
   // Convert the books object to an array of book objects
   const booksArray = Object.values(books);
 
   // Wrap the logic inside a new Promise
   new Promise((resolve, reject) => {
     // Find the book with the matching ISBN
     const book = booksArray.find(book => book.isbn === isbn);
 
     if (book) {
       console.log(`Found book details based on the ISBN: ${isbn}.`);
       resolve(book);
     } else {
       console.log(` The Book with the selected ISBN:${isbn} does not exist.`)
       reject(new Error("Book does not exist"));
     }
   })
   .then(book => {
     res.send(book);
   })
   .catch(error => {
     res.send({ message: error.message });
   });
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
  
//  Get book reviews based on the isbn
public_users.get('/review/:isbn', function (req, res) {
  
  const isbn = (req.params.isbn); // Get ISBN from the request

  // Convert the books object to an array of book objects
  const booksArray = Object.values(books);

  // Find the book with the matching ISBN
  const book = booksArray.find(book => book.isbn === isbn);

  if (book) {
    // Check if the book.reviews is an empty object.
    if (Object.keys(book.reviews).length === 0) {
      res.send({ message: "Please add a review"});
    } else {
      res.send({ reviews: book.reviews });
    }
  } else {
    res.send({ message: "Book does not exist" });
  }
});

module.exports.general = public_users;
