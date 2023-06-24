const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
      if (!isValid(username)) {
          users.push({"username":username, "password":password})
          return res.status(200).json({message: "Register success! Now you can login."})
      } else {
          return res.status(404).json({message: "User already exist!"});
      }
  }
  return res.status(404).json({message: "Unable to register user."})
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn
  return res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const result = [];

  for (const key in books) {
      if (books.hasOwnProperty(key)) {
          const book = books[key]
          if (book.author.toLowerCase() === author.toLowerCase()) {
              result.push(book)
          }
      }
  }
  return res.send(result)
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const result = [];

  for (const key in books) {
      if (books.hasOwnProperty(key)) {
          const book = books[key]
          if (book.title.toLowerCase() === title.toLowerCase()) {
              result.push(book)
          }
      }
  }
  return res.send(result);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn
  if (books.hasOwnProperty(isbn)) {
      const book = books[isbn];
      const reviews = book.reviews;
      if (Object.keys(reviews).length > 0) {
          return res.send(reviews);
      } else {
          return res.send("There is no reviews available for this book")
      }
  } else {
      return res.status(404).send("Book not found!");
  }
});

// Async Function

const axios = require('axios')

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const response = await axios.get('http://localhost:5000/');
    const booksData = response.data;
  
    return res.send(JSON.stringify(booksData,null,4));
  } catch (error) {
    console.error('Error retrieving book data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
  
// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
//Write your code here
  const isbn = req.params.isbn
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      return res.send(response.data);
    })
    .catch(error => {
      console.error(error);
      return res.status(500).send("Error retrieving book details.")
    })
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const result = [];
  
    axios.get(`http://localhost:5000/author/${author}`)
      .then(response => {
        const booksByAuthor = response.data;
        for (const key in booksByAuthor) {
          if (booksByAuthor.hasOwnProperty(key)) {
            const book = booksByAuthor[key];
            result.push(book);
          }
        }
        return res.send(result);
      })
      .catch(error => {
        console.error(error);
        return res.status(500).send("Error retrieving book details.");
      });
});

// Get book details based on title
public_users.get('/title/:title', async function (req, res) {
    //Write your code here
    const title = req.params.title;
    const result = [];
  
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        const booksByTitle = response.data;
        for (const key in booksByTitle) {
            if (booksByTitle.hasOwnProperty(key)) {
                const book = booksByTitle[key]
                result.push(book)
                }
            }
        return res.send(result);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Error retrieving book details.");
    }
});

module.exports.general = public_users;
