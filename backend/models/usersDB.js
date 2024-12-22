const mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: String,
    phone: String,
    businessName: String,
    googleId: { type: String, unique: true, sparse: true },   // Google OAuth field, sparse to allow null
    email: { type: String, unique: true },
    loginMethod: { type: String, enum: ['google', 'standard', 'google+standard'], default: 'standard' }
});

var User = mongoose.model("User", userSchema);
module.exports = User;
