const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Electrician = require('../models/electricians');
const { isOwner } = require('../middleware'); // Import your ownership middleware
const { isLoggedIn } = require("../middleware.js");
const User = require("../models/user.js")
const mongoose = require('mongoose');
router.post('/book', async (req, res) => {
    const { customerName, customerAddress, customerMobile, electricianId,userId } = req.body;
    console.log("Booking request received");  
    console.log(req.body);
    // const userId = req.user._id;
   
         

       
    try {
        // const electrician = await Electrician.findById(electricianId);
        // if (!electrician) {
        //     return res.status(404).json({ error: 'Electrician not found' });
        // }

        const booking = new Booking({
            customerName,
            customerAddress,
            customerMobile,
            electricianId, // Use this instead of electrician
            userId, // Add this line to include userId
            customerId:req.user._id,
            bookingDate:  new Date(),
        });
        await booking.save();

        // Send back a response with the 'message' field
        res.json({ message: 'Booking successful', booking });
    } catch (error) {
        console.error('Error saving booking:', error.message);
        res.status(500).json({ error: 'Booking failed' });
    }
});

// DELETE route to unbook an electrician
router.delete('/unbook/:electricianId/:customerId', async(req, res) => {
    const { electricianId, customerId } = req.params;

    // Convert IDs to ObjectId before querying
         // Find the electrician whose booking was canceled
         const electrician = await User.findById(req.user._id);
         if (!electrician) {
             res.send('hdkjhd')
         }
                 console.log(electrician);
                 
                 if (electrician && req.user._id == electrician.id) {
                     // Increase the electrician's charges by a certain amount (e.g., ₹100)
                     electrician.charges += 100;
                     await electrician.save(); // Save the updated electrician details
                 }
         

    // Find and delete the booking with matching electricianId and customerId
    Booking.findOneAndDelete({ electricianId: electricianId, customerId: customerId })
    
        .then(deletedBooking => {
            if (deletedBooking) {
                res.status(200).json({ message: "Booking deleted successfully!" });
            } else {
                res.status(404).json({ error: "No booking found with the provided electrician and customer IDs." });
            }
        })
        .catch(err => {
            res.status(500).json({ error: "Error deleting the booking.", details: err });
        });
});

// Route to fetch bookings for a specific electrician
router.get('/:electricianId',isLoggedIn, async (req, res) => {
    const electricianId = req.params.electricianId; // Get electricianId from the route parameters
    console.log(electricianId);
    
    try {
      // Fetch bookings for the specific electrician
      const bookings = await Booking.find({ userId: electricianId });
      if (!bookings) {
        return res.status(404).send('No bookings found for this electrician');
      }
        console.log(bookings);
        
      if (bookings.length === 0) {
        return res.status(404).send('No bookings found for this electrician');
      }
      
      // Render the bookings page with filtered bookings
      res.render('bookings/bookings', { bookings });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).send('not found ');
    }
  });

// Route to unbook (cancel) a booking
router.post('/unbook', async (req, res) => {
    const { bookingId } = req.body;

    try {
        // Find the booking by ID and update its status
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Update the status to 'Unbooked'
        booking.status = 'Unbooked';
        await booking.save();

        res.json({ message: 'Booking canceled successfully', booking });
    } catch (error) {
        console.error('Error during unbooking:', error);
        res.status(500).json({ error: 'Unbooking failed' });
    }
});

// Route to view a specific booking
router.get('/:id', isOwner, async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await Booking.findById(id).populate('electrician'); // Populate electrician details
        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect('/bookings'); // Redirect to bookings page if not found
        }
        res.render('bookings/show', { booking, success: req.flash("success"), error: req.flash("error") });
    } catch (error) {
        console.error('Error fetching booking:', error);
        req.flash("error", "Failed to fetch booking details!");
        res.redirect('/bookings'); // Redirect to bookings page if there's an error
    }
});
// Route to delete a booking
router.delete('/:id', isOwner, async (req, res) => {
    const { id } = req.params;

    try {
        // Find the booking and delete it
        const booking = await Booking.findByIdAndDelete(id);
               // Find the electrician whose booking was canceled
            
               
        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect('/bookings');
        }

 
        req.flash("success", "Booking canceled successfully, and electrician's charges increased!");
        res.redirect('/bookings'); // Redirect to bookings list after deletion

    } catch (error) {
        console.error('Error deleting booking or updating charges:', error);
        req.flash("error", "Failed to cancel booking and update charges!");
        res.redirect('/bookings');
    }
});


module.exports = router;
