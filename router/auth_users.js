const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.json');
const regd_users = express.Router();

let users = []; // { username, password }

const isValid = (username) => typeof username === 'string' && username.trim() !== '' &&
  !users.some(u => u.username === username);

const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

// Task 7: login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });
  if (!authenticatedUser(username, password))
    return res.status(401).json({ message: 'Invalid login. Check username and password' });

  const accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: 'User successfully logged in' });
});

// Task 8: add or modify a review (review text via query string ?review=...)
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  const review = req.query.review || (req.body && req.body.review);
  const username = req.session.authorization.username;
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!review) return res.status(400).json({ message: 'Review text required' });

  const existed = book.reviews[username] !== undefined;
  book.reviews[username] = review; // one review per user per book
  return res.status(200).json({
    message: `Review ${existed ? 'updated' : 'added'} for ISBN ${req.params.isbn}`,
    reviews: book.reviews
  });
});

// Task 9: delete the logged-in user's own review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  const username = req.session.authorization.username;
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (book.reviews[username] === undefined)
    return res.status(404).json({ message: 'You have no review for this book' });

  delete book.reviews[username];
  return res.status(200).json({ message: `Review for ISBN ${req.params.isbn} deleted` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.getUsers = () => users;
