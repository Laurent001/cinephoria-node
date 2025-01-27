const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.get("/user/:id", bookingController.getBookingsByUserId);
router.post("/user/:id", bookingController.createBookingByUserId);
router.get("/screening/:id", bookingController.getSeatsByScreeningId);

module.exports = router;
