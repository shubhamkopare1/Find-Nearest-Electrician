// routes/users.js
const express = require('express');
const passport = require('passport');
const User = require('../models/user'); // Adjust the path based on your directory structure
const Electricians = require('../models/electricians');
const Data = require("../models/addElectrician.js")

const router = express.Router();

// Signup Route
router.get('/register', (req, res) => {
    res.render('users/register'); // Render the registration form
});

router.post('/register', async (req, res) => {
    try {
        const { username, password, email,charges } = req.body;

        // Create a new user with username and email
        const user = new User({ username, email,charges });

        // Register the user with passport-local-mongoose
        await User.register(user, password); // Registers the user with the provided password

        req.flash('success', 'Welcome to the Electrician app!');
        res.redirect('/electricians'); // Redirect after successful registration
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register'); // Redirect back if there's an error
    }
});


// Login Route
router.get('/login', (req, res) => {
    res.render('users/login'); // Render the login form
});

router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/electricians'); // Redirect after successful login
});

// Logout Route
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err); // Handle logout error
        req.flash('success', 'Goodbye!'); // Flash message after successful logout
        res.redirect('/login'); // Redirect to login after logout
    });
});
// Profile Route
router.get('/profiles', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to view your profile.');
        return res.redirect('/login');
    }
    const userId = req.user._id;


    const data = await Data.find({userId :userId })
    res.render('users/profile', { user: req.user , data});
});

// Delete Profile Route
router.delete('/data/:id', async (req, res) => {
    const { id } = req.params;
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to delete a profile.');
        return res.redirect('/login');
    }

    try {
        await Data.findByIdAndDelete(id); // `Data` is your Mongoose model
        req.flash('success', 'Profile deleted successfully.');
        res.redirect('/profiles');
    } catch (err) {
        console.log(err);
        req.flash('error', 'Unable to delete profile.');
        res.redirect('/profiles');
    }
});

router.get('/user/bookings/:userId', async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId }).populate('electrician');
        res.render('electricians/userBookings', { bookings }); // Render user bookings page with bookings data
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).send('Could not fetch bookings');
    }
});



module.exports = router;
