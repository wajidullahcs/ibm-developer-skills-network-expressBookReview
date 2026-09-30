const express = require('express');
const axios = require('axios');
const books = require('./booksdb.json');
const auth = require('./auth_users.js');
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

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

const getBooks = () => new Promise(resolve => resolve(books));

// Task 1: all books
public_users.get('/', async (req, res) => {
  const all = await getBooks();
  return res.status(200).send(JSON.stringify(all, null, 4));
});

// Task 2: by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const all = await getBooks();
  const book = all[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book);
});

// Task 3: by author
public_users.get('/author/:author', async (req, res) => {
  const all = await getBooks();
  const q = req.params.author.toLowerCase();
  const result = Object.entries(all)
    .filter(([, b]) => b.author.toLowerCase() === q || b.author.toLowerCase().includes(q))
    .map(([isbn, b]) => ({ isbn, ...b }));
  if (!result.length) return res.status(404).json({ message: 'No books found for author' });
  return res.status(200).json({ booksbyauthor: result });
});

// Task 4: by title
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

// ---------- Axios implementations (Tasks 10-13) ----------

// Task 10: all books, async/await with Axios
const getAllBooksAxios = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

// Task 11: book by ISBN, Promise callbacks with Axios
const getBookByISBNAxios = (isbn) =>
  axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
    .then(response => response.data);

// Task 12: books by author, async/await with Axios
const getBooksByAuthorAxios = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

// Task 13: books by title, Promise callbacks with Axios
const getBooksByTitleAxios = (title) =>
  axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then(response => response.data);

public_users.get('/async/books', async (req, res) => {
  try {
    return res.status(200).json(await getAllBooksAxios());
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books' });
  }
});

public_users.get('/async/isbn/:isbn', (req, res) => {
  getBookByISBNAxios(req.params.isbn)
    .then(data => res.status(200).json(data))
    .catch(error => res.status(error.response ? error.response.status : 500)
      .json({ message: 'Book not found' }));
});

public_users.get('/async/author/:author', async (req, res) => {
  try {
    return res.status(200).json(await getBooksByAuthorAxios(req.params.author));
  } catch (error) {
    return res.status(error.response ? error.response.status : 500)
      .json({ message: 'No books found for author' });
  }
});

public_users.get('/async/title/:title', (req, res) => {
  getBooksByTitleAxios(req.params.title)
    .then(data => res.status(200).json(data))
    .catch(error => res.status(error.response ? error.response.status : 500)
      .json({ message: 'No books found for title' }));
});

module.exports.general = public_users;