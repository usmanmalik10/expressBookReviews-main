const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userswithsamename = users.filter((user) => {
      return user.username === username
  });
  if (userswithsamename.length > 0){
      return true;
  } else {
      return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validuser = users.filter((user) => {
      return (user.username === username && user.password === password)
  });
  if (validuser.length > 0) {
      return true
  } else {
      return false
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username
  const password = req.body.password

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in! Please register first!"})
  }
  if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 })
      req.session.authorization = {
          accessToken,username
      }
      return res.status(200).send("Login succesful! Welcome aboard.");
  } else {
      return res.status(208).json({message: "Invalid Login. Check username and password!"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const {review} = req.body;
  const {username} = req.session.authorization
  const book = books[isbn];

  if (!isbn || !review) {
      return res.status(400).json({message: "ISBN and review are required fields"});
  }
  if (!book) {
      return res.status(404).json({message: "Book not found."})
  }
  // Check if the user has already made a review
  if (book.reviews.hasOwnProperty(username)) {
      // Modify the existing review
      book.reviews[username] = review
      return res.status(200).json({message: "Review has been modified successfully."})
  }
  
  // Add a new review
  book.reviews[username] = review;
  return res.status(200).json({message: "Review has been successfully added"})
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req,res) => {
  // Write the code here
  const isbn = req.params.isbn;
  const {username} = req.session.authorization
  const book = books[isbn];
  
  if (!isbn) {
      return res.status(400).json({message: "ISBN is a required fields."})
  }
  if (!book) {
      return res.status(404).json({message: "Book not found."})
  }
  if (book.reviews.hasOwnProperty(username)) {
      // Delete existing review
    delete book.reviews[username]
    return res.status(200).json({message: "Your review has been successfully deleted"})
  }
  return res.status(404).json({message: "You haven't review this book"})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
