import express from "express";
import {
  createBooking,
  deleteBookingById,
  getBookingsByUserId,
  getLast7DaysBookingsByFilmId,
} from "../controllers/bookingController.js";
import { getSeatsByScreeningId } from "../controllers/screeningController.js";
const router = express.Router();

router.get("/last7days/:filmId", getLast7DaysBookingsByFilmId);
router.get("/user/:id", getBookingsByUserId);
router.post("/create", createBooking);
router.get("/screening/:id", getSeatsByScreeningId);
router.delete("/screening/:id", deleteBookingById);
router.delete("/:id", deleteBookingById);

export default router;
