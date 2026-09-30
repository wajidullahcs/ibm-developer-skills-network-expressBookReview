// Demonstrates async/await and Promise callbacks with Axios (run while server is up)
const axios = require('axios');
const base = 'http://localhost:5000';

const allBooks = async () => (await axios.get(`${base}/`)).data;
const byISBN = (isbn) => axios.get(`${base}/isbn/${isbn}`).then(r => r.data);
const byAuthor = async (a) => (await axios.get(`${base}/author/${encodeURIComponent(a)}`)).data;
const byTitle = (t) => axios.get(`${base}/title/${encodeURIComponent(t)}`).then(r => r.data);

(async () => {
  try {
    console.log(await allBooks());
    console.log(await byISBN(1));
    console.log(await byAuthor('Jane Austen'));
    console.log(await byTitle('Molloy'));
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
})();
