const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean to show if the username is valid or not.
  return username.length >= 6 && /[a-z]+/i.test(username) && /[0-9]+/.test(username);
}

const authenticatedUser = (username,password)=>{
   const user = users.find(user => user.username === username && user.password === password);
   return user !== undefined;
}

//Only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;  
  const password = req.body.password;

  const user = users.find(user => user.username === username && user.password === password); //Checks if the username and password currently exist in the array

  if(authenticatedUser(username, password)){
    const accessToken = jwt.sign({username: user.username}, "access"); 
    req.session.authorization = {accessToken};
    return res.status(200).json({message: "User successfully logged in"}); // Sends a response if the user is successfully logged in
  } else {
    return res.status(401).json({message: "Invalid username or password"}); // Sends a response if the user has an invalid username or password
  }

});

//Sets the endpoint for login to "/customer/login"
regd_users.use("/customer/login", regd_users);

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
