import express from "express";
import {
  createBooking,
  deleteBookingById,
  getBookingsByUserId,
  getLast7DaysBookingsByFilmId,
  getSeatsByScreeningId,
} from "../controllers/bookingController.ts";

const router = express.Router();

router.get("/last7days/:filmId", getLast7DaysBookingsByFilmId);
router.get("/user/:id", getBookingsByUserId);
router.post("/create", createBooking);
router.get("/screening/:id", getSeatsByScreeningId);
router.delete("/screening/:id", deleteBookingById);
router.delete("/:id", deleteBookingById);

export default router;
