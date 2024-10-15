const Listing = require("./models/addElectrician.js");

const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/expressError.js");

// middleware/bookingMiddleware.js
const Booking = require("./models/Booking"); // Adjust the path as necessary

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the booking by id
    const booking = await Booking.findById(id);

    // Check if the booking exists
    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/bookings"); // Redirect to bookings page if not found
    }

    // Check ownership
    if (!booking.owner.equals(req.user._id)) {
      // Assuming `owner` field exists in Booking
      req.flash("error", "You do not have permission to access this booking!");
      return res.redirect("/bookings"); // Redirect to bookings page if not the owner
    }

    // If ownership is verified, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error in isOwner middleware:", error);
    req.flash("error", "An error occurred while verifying ownership!");
    res.redirect("/bookings"); // Redirect to bookings page on error
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirect = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
};
module.exports.isLoggedIns = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirect = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("userLogin");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirect) {
    res.locals.redirectUrl = req.session.redirect;
  }
  next();
};


module.exports.isUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === "user") {
    return next(); // Allow access if logged in as a regular user
  }
  req.flash("error", "You do not have permission to access this page!");
  return res.redirect("/login"); // Redirect to login if not authorized
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const { listings } = req.body;

  // Find the listing by id
  const review = await Review.findById(reviewId);

  // Check if the listing exists
  if (!review) {
    req.flash("error", "review not found!");
    return res.redirect(`/listings/${id}`);
  }

  // Check ownership before update
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not author of this review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// Middleware to check if the user is the owner of the resource
module.exports.isOwner = async (req, res, next) => {
  const { electricianId } = req.params; // Assuming `electricianId` is coming from params
  const userId = req.user._id; // Assuming `req.user` contains the logged-in user's data

  try {
      // Database se electrician booking ka data le aao
      const booking = await Booking.findOne({ electricianId });

      if (!booking) {
          return res.status(404).json({ error: 'Booking not found' });
      }

      // Check karo ki current user hi booking ka owner hai ya nahi
      if (booking.customerId.toString() !== userId.toString()) {
          return res.status(403).json({ error: 'Aap is resource ke owner nahi hain.' });
      }

      // Agar owner hai, to next middleware ko call karo
      next();
  } catch (error) {
      console.error('Error in isOwner middleware:', error);
      return res.status(500).json({ error: 'Server error' });
  }
};
