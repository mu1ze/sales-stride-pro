const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    duration: { type: Number, required: true } // in seconds
});

const clientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true}, // reference to user
    name: { type: String, required: true },
    rate: { type: Number, required: true },
    totalTime: { type: Number, default: 0 }, // in seconds
    sessions: [sessionSchema],
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Index for quick search by userId
clientSchema.index({ userId: 1 });

module.exports = mongoose.model('clients', clientSchema);