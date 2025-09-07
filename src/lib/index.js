const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config'); // Assuming config.js exports the Mongoose model
const session = require('express-session');

const authRoute = require('../Backend/Routes/authRoute');
const clientRoute = require('../Backend/Routes/clientRoute');

const app = express();

//Convert Data into JSON format
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/auth', authRoute);
app.use('/api/clients', clientRoute);
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// use ejs as the view engine
app.set('view engine', 'ejs');

// Create a static file {this allows the public folder to be served}
app.use(express.static('public'));

// render teh login page and signup page
app.get('/', (req, res) => {
  res.render("login");
});

app.get('/signup', (req, res) => {
  res.render("signup");
});

// Define teh poert and start the server
const port = 5500;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});