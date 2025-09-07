const router = require("express").Router();
const collection = require("../Models/authModel");
const bcrypt = require('bcrypt');
const session = require('express-session');


// Register Users
router.post('/signup', async (req, res) => {
  const data = { 
        name: req.body.fullname,
        number: req.body.number,
        email: req.body.email,
        password: req.body.password
  }

  // Check if the user already exists
  const existingUser = await collection.findOne({ email: data.email });
  if (existingUser) {
    return res.status(400).send('User already exists');
  }
  else{

    // Hash the password before saving
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword; // Replace the plain password with the hashed one

    const userdata = await collection.insertMany(data);
    console.log(userdata);
    res.redirect('/'); // Redirect to login page after signup
  }

});

// Login a User
router.post('/login', async (req, res) => {
    try{
        // Check if the user exists
        const check = await collection.findOne({ email: req.body.email });
        if(!check) {
            return res.send('User does not exist');
        }   

        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(req.body.password, check.password);
        if(isMatch) {
            // Passwords match, home page
            //req.session.userId = check._id; // Store user ID in session
            res.render("home", { user: check._id });
        }else{
            res.send('Invalid password');
        }
    }catch{
        res.send('Wrong login details');
    }
});

module.exports = router;
