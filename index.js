const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

app.use('/customer', session({
  secret: 'fingerprint_customer',
  resave: true,
  saveUninitialized: true
}));

// Protect everything under /customer/auth/*
app.use('/customer/auth/*', (req, res, next) => {
  const token = req.session.authorization && req.session.authorization.accessToken;
  if (!token) return res.status(401).json({ message: 'User not logged in' });
  jwt.verify(token, 'access', (err, user) => {
    if (err) return res.status(403).json({ message: 'User not authenticated' });
    req.user = user;
    next();
  });
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
