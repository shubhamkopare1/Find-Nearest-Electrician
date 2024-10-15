const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataSchema = new Schema({
    name: String,
    location: String,
    charges: Number,
    contactNumber: String,
    experience: String,
    description: String,
    lat: Number,
    lon: Number,
    userId: { type: Schema.Types.ObjectId, ref: 'User' } // Reference to the user who added the electrician
});

// Check if the model already exists, otherwise define it
const Data = mongoose.models.Electrician || mongoose.model('Data', dataSchema);

module.exports = Data;
