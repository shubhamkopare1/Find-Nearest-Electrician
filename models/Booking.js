const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', }, // The 'user' field
    electricianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerMobile: { type: String, required: true },
    bookingDate: { type: Date, required: true }, // Adding booking date field
    status: { type: String, default: 'Pending' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  });
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
