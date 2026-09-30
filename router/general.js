const express = require('express');
const books = require('./booksdb.json');
const auth = require('./auth_users.js');
const public_users = express.Router();

// Task 6: register
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });
  if (!auth.isValid(username))
    return res.status(409).json({ message: 'User already exists or invalid username' });
  auth.users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered. You can now log in' });
});

// Promise-based data access (non-blocking, safe for concurrent requests)
const getBooks = () => new Promise(resolve => resolve(books));

// Task 1 / 10: all books
public_users.get('/', async (req, res) => {
  const all = await getBooks();
  return res.status(200).send(JSON.stringify(all, null, 4));
});

// Task 2 / 11: by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const all = await getBooks();
  const book = all[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book);
});

// Task 3 / 12: by author
public_users.get('/author/:author', async (req, res) => {
  const all = await getBooks();
  const q = req.params.author.toLowerCase();
  const result = Object.entries(all)
    .filter(([, b]) => b.author.toLowerCase() === q || b.author.toLowerCase().includes(q))
    .map(([isbn, b]) => ({ isbn, ...b }));
  if (!result.length) return res.status(404).json({ message: 'No books found for author' });
  return res.status(200).json({ booksbyauthor: result });
});

// Task 4 / 13: by title
public_users.get('/title/:title', async (req, res) => {
  const all = await getBooks();
  const q = req.params.title.toLowerCase();
  const result = Object.entries(all)
    .filter(([, b]) => b.title.toLowerCase().includes(q))
    .map(([isbn, b]) => ({ isbn, ...b }));
  if (!result.length) return res.status(404).json({ message: 'No books found for title' });
  return res.status(200).json({ booksbytitle: result });
});

// Task 5: reviews for a book
public_users.get('/review/:isbn', async (req, res) => {
  const all = await getBooks();
  const book = all[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
