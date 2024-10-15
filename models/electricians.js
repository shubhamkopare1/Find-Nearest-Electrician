// models/user.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const ElectriciansSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true,  }, // Add email field
    password: String,
});

// Adding passport-local-mongoose methods to the user schema
ElectriciansSchema.plugin(passportLocalMongoose);

const Electricians = mongoose.model('Electricians', ElectriciansSchema);
module.exports = Electricians;

