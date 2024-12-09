// app.js (Your existing code)
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const cors = require("cors");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const ExpressError = require("./utils/expressError.js");
const electricianRoutes = require("./routes/electricians");
const userRouter = require("./routes/users");
const reviewRouter = require("./routes/reviews");
const electricianRouter = require("./routes/userdata.js");
const { isLoggedIn } = require("./middleware.js");
const User = require("./models/user.js");
const bookingRoutes = require("./routes/bookings");
const Electrician = require("./models/electricians");
const Electricians = require("./models/addElectrician.js");
const Data = require("./models/addElectrician.js")
const { isLoggedIns } = require("./middleware.js");
const Review = require("./models/review.js")
const Booking = require("./models/Booking");
const app = express();
const port = 8080;
app.use(express.static('public'));
// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.json());
// Connect to MongoDB
async function main() {
  try {
    await mongoose.connect(
      // 'mongodb+srv://shubhamkopare2004:8IPYrnKMZCWCbEbl@cluster0.nzz1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
      'mongodb://127.0.0.1:27017/electric'
    );
    console.log("\n mongoDb database connected successfully ");
  } catch (error) {
    console.log("error detected while db connected ", error);
  }
}

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const sessionOption = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Routes
app.get("/electrician", (req, res) => {
  res.render("electrician/main");
});

app.use("/electricians", electricianRoutes);
app.use("/", userRouter);
app.use("/", electricianRouter);
app.use("/bookings", bookingRoutes);

app.use("/", reviewRouter);

// app.get('/electricians', async (req, res) => {
//     const electricians = await Electrician.find(); // Fetch all electricians from the database
//     res.render('your-template-file', { electricians }); // Pass the electricians array to the EJS template
// });

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/userHome", isLoggedIns, async (req, res) => {
  const electricians = await Data.find();
  const userId= req.user.id;
  res.render("userLogin/home", { electricians ,userId});
});

app.get("/userLogin", (req, res) => {
  res.render("userLogin/login"); // Render the login form
});

app.get("/order/:id",isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the user is logged in and req.user exists

    // Find all bookings made by the current customer
    const bookings = await Booking.find({ customerId: userId });

    if (!bookings || bookings.length === 0) {
      return res.status(404).send("No bookings found");
    }

    // For each booking, find the associated electrician's data
    const orderDetails = await Promise.all(
      bookings.map(async (booking) => {
        const electrician = await Data.findOne({ _id: booking.electricianId });
        return {
          bookingDate: booking.bookingDate,
          booking,
          electrician
        };
      })
    );

    // Render the orders page with all booking and electrician data
    res.render("userLogin/order", { orders: orderDetails });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/book", async (req, res) => {
  const booking = await Booking.find();
  res.render("userLogin/db", { booking });
  // This will retrieve all bookings
  console.log("All bookings:", booking);
});

app.delete('/reviews/:id', async (req, res) => {
  try {
      const reviewId = req.params.id;
      await Review.findByIdAndDelete(reviewId);
      req.flash('success', 'Review deleted successfully.'); // Flash message for success
      res.redirect('/profiles'); // Redirect back to the profile or wherever appropriate
  } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to delete review.'); // Flash message for error
      res.redirect('/profiles'); // Redirect back to the profile or wherever appropriate
  }
});
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page is not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "something went wrong" } = err;
  console.error(err.stack);
  res.status(statusCode).render("error.ejs", { message });
});

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
