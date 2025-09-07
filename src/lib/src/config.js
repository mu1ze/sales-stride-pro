const mongoose = require('mongoose');
const { long } = require('webidl-conversions');
const connect = mongoose.connect("mongodb://localhost:27017/HourGlss")

// Check if the connection is successful
connect.then(() => {
    console.log("Connected to MongoDB successfully");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

/*const loginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

// Create a model for the db
const collection = mongoose.model('users', loginSchema);

module.exports = collection;*/