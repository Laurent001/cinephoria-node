const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get("/user/:id", bookingController.getBookingsByUserId);
router.post("/create", bookingController.createBooking);
router.get("/screening/:id", bookingController.getSeatsByScreeningId);

module.exports = router;
