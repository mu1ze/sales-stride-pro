const mongoose = require('mongoose');
const { long } = require('webidl-conversions');

const loginSchema = new mongoose.Schema({
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
const auth = mongoose.models.users || mongoose.model('users', loginSchema);
module.exports = auth;