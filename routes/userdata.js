const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Electrician = require("../models/customer");
const Electricians = require('../models/electricians');
const User = require('../models/user'); 
const { isLoggedIn } = require("../middleware"); // Your custom middleware
const passport = require("passport");

// Registration Route
router.get("/userRegister", (req, res) => {
  res.render("userLogin/register");
});

router.post("/userRegisters", async (req, res) => {
  try {
    const { username, password, email ,charges } = req.body;
    const user = new User({ username, email });
    await User.register(user, password, charges); // Register the user
    req.flash("success", "Welcome to the Electrician app!");
    res.redirect("userHome");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/userRegister");
  }
});

// Login Route
router.get("/userLogin", (req, res) => {
  res.render("userLogin/logins");
});

router.post(
  "/userLogin",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/userLogin",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("userHome");
  }
);

// Logout Route
router.get("/userLogout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Goodbye!");
    res.redirect("/userLogin");
  });
});

// Profile Route (Protected)
router.get("/userProfile", isLoggedIn, (req, res) => {
  res.render("userLogin/profile", { user: req.user });
});

// User Bookings Route (Protected)
router.get("/user/bookings/:userId", isLoggedIn, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId }).populate(
      "electrician"
    );
    res.render("electricians/userBookings", { bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).send("Could not fetch bookings");
  }
});

module.exports = router;
