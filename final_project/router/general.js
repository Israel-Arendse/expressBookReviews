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


// Helps the function of a book based on its property
const findBookByProperty = (property, value) => {
   return new Promise((resolve, reject) => {
      const booksArray = Object.values(books);
      const book = booksArray.find(book => book[property] === value);
      if (book) {
        resolve(book);
      } else {
        reject(new Error(`Book with ${property} ${value} does not exist`));
      }
    });

};

async function fetchBooks(){
  return Promise.resolve(books);
};


// Get the book list available in the shop
public_users.get("/", async function (req, res) {
    try{
      const books = await fetchBooks();
      res.status(200).json(JSON.stringify(books,null));   
    } catch (error) {
      console.error('Error getting list of books ', error);
      res.status(500).json({ error: 'Internal server error'});
    }
});

// Get book details based on the ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    console.log(`Getting book details based on the ISBN: ${isbn}...`);

    try {
        
        // Find the book based on the property: 'isbn'
        const book = await findBookByProperty('isbn',isbn);

        if (book) {
            console.log(`Found book details based on the ISBN: ${isbn}.`);
            res.send(book);
        } else {
            throw new Error("Book does not exist");
        }
    } catch (error) {
        res.send({ message: error.message });
    }
});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = decodeURIComponent(req.params.author);
    console.log(`Getting the book details based on the author: ${author}`);

    try {
        
        // Finds the book based on the property:'author'
        const book = await findBookByProperty('author', author);

        if (book) {
            console.log(`Found details on the books written by the Author: ${author}.`);
            res.send(book);
        } else {
            throw new Error("Author not listed");
        }
    } catch (error) {
        res.send({ message: error.message });
    }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = decodeURIComponent(req.params.title);

    try {
        
        // Finds the book based on the property:'title'
        const book =  await findBookByProperty('title', title);

        if (book) {
            res.send(book);
        } else {
            throw new Error("Title not found");
        }
    } catch (error) {
        res.send({ message: error.message });
    }
});

  
//  Get book reviews based on the isbn
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = (req.params.isbn); // Get ISBN from the request

  // Finds the book reviews based on the property: 'isbn'
  const book = findBookByProperty('isbn', isbn);

  if (book) {
    // Check if the book.reviews is an empty object.
    if (Object.keys(book.reviews).length === 0) {
      res.send({ message: "Please add a review"});
    } else {
      res.send({ reviews: book.reviews });
    }
  }else{
    res.send({ message: "Book does not exists"});
  }
});


module.exports.general = public_users;

