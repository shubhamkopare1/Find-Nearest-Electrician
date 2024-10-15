// routes/electricians.js
const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Data = require('../models/addElectrician');
const { isLoggedIn } = require("../middleware.js");
const Booking = require("../models/Booking.js")

// Route to show the form
router.get('/new', isLoggedIn,(req, res) => {
    res.render('electricians/new');
});
router.post('/electricians/new', async (req, res) => {
    const { name, location, charges, experience, lat, lon, contactNumber, description } = req.body;

    // Assuming the authenticated user's ID is stored in req.user._id
    const userId = req.user._id; // Ensure that req.user exists and contains the user's ID
    
    const newElectrician = new Data({
        name,
        location,
        charges,
        experience,
        lat,
        lon,
        contactNumber,
        description,
        userId // Adding the userId to track who added the electrician
    });

    try {
        await newElectrician.save();
        res.redirect('/electricians'); // Redirect to the electricians list or another page
    } catch (error) {
        console.error("Error saving electrician:", error);
        res.status(500).send("Internal Server Error");
    }
});



router.get('/bookings/:id', async (req, res) => {
    try {
     
            const electricianId = req.params.id;
        const bookings = await Booking.find({ electrician: electricianId }).populate('user');
        console.log('Found bookings:', bookings);
        if (!bookings.length) {
            console.log(`No bookings found for electrician ID: ${electricianId}`);
        }
        
    } catch (error) {
        console.error('Error fetching electrician bookings:', error);
        res.status(500).send('Could not fetch bookings');
    }
});




// Route to display all electricians on the map
router.get('/', isLoggedIn, async (req, res) => {
    if (req.isAuthenticated()) {
         const electricians = await Data.find();
         let user = req.user;
    res.render('electricians/main', { electricians ,user});
      } else {
        res.redirect('/login');
      }
 
});

// Route to get a specific electrician by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid Electrician ID');
        return res.redirect('/electricians'); // Redirect to the electricians list if the ID is invalid
    }

    const electrician = await Data.findById(id);
    if (!electrician) {
        req.flash('error', 'Electrician not found');
        return res.redirect('/electricians');
    }

    res.render('electricians/info', { electrician });
});

module.exports = router;
