const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Review = require('../models/review');
const User = require('../models/user');
const Data = require('../models/addElectrician');

// routes/reviews.js
router.post('/electricians/:id/review', async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const electricianId = req.params.id; // The electrician's ID from the URL
        const userId = req.user ? req.user._id : null; // Assuming the user is authenticated

        // Ensure electricianId is valid
        if (!mongoose.Types.ObjectId.isValid(electricianId)) {
            return res.status(400).json({ message: 'Invalid electrician ID' });
        }

        // Ensure user is logged in
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find the electrician by its ID to get the `userId`
        const electrician = await Data.findById(electricianId); // Assuming you have an `Electrician` model
        if (!electrician) {
            return res.status(404).json({ message: 'Electrician not found' });
        }

        const electricianUserId = electrician.userId; // Extract the `userId` from the electrician document

        // Create a new review
        const newReview = new Review({
            userId, // The logged-in user's ID
            electricianUserId, // The userId associated with the electrician
            rating,
            comment
        });

        // Save the review to the database
        await newReview.save();
        
        const electricians = await User.findById(electricianUserId);
        if (!electricians) {
            return res.status(404).json({ message: 'Electrician not found' });
        }
        
        // Add the review ID to the electrician's reviews array
        electricians.reviews.push(newReview._id);
        
        // Save the updated electrician with the review ID in the reviews array
        await electricians.save();
        req.flash('success', 'Feedback Add successfully.'); // Flash message for success
        res.redirect("/userHome")
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'An error occurred while submitting the review.' });
    }
});

module.exports = router;




