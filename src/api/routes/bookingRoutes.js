const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get("/user/:id", bookingController.getBookingsByUserId);
router.post("/create", bookingController.createBooking);
router.get("/screening/:id", bookingController.getSeatsByScreeningId);
router.delete("/screening/:id", bookingController.deleteBookingById);
router.delete("/:id", bookingController.deleteBookingById);

module.exports = router;
