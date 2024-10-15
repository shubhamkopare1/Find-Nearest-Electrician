// models/user.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const CustomerSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true,  }, // Add email field
    password: String,
});

// Adding passport-local-mongoose methods to the user schema
CustomerSchema.plugin(passportLocalMongoose);

const Customer = mongoose.model('Customer', CustomerSchema);
module.exports = Customer;

