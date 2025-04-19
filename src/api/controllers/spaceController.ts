import { Request, Response } from "express";
import { fetchBookingsByUserId } from "./bookingController.js";
import { fetchOpinionByUserIdAndFilmId } from "./opinionController.js";
import { fetchScreeningById } from "./screeningController.js";
import { fetchStatuses } from "./statusController.js";
import { fetchUserById } from "./userController.js";

export const getSpaceByUserId = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);

  try {
    const rows = await fetchBookingsByUserId(userId);

    const bookingsMap: Record<
      number,
      {
        id: number;
        user: any;
        totalPrice: number;
        screening: any;
        seats: {
          id: number;
          number: number;
          is_handi: boolean;
          is_available: boolean;
        }[];
        opinion: any;
        film_id: number;
        endTime?: Date;
      }
    > = {};

    for (const row of rows) {
      if (!bookingsMap[row.booking_id]) {
        const user = await fetchUserById(row.booking_user_id);
        const opinion = await fetchOpinionByUserIdAndFilmId(
          row.booking_user_id,
          row.film_id
        );
        bookingsMap[row.booking_id] = {
          id: row.booking_id,
          user: user,
          totalPrice: row.booking_total_price,
          screening: null,
          seats: [],
          opinion: opinion,
          film_id: row.film_id,
        };
      }

      bookingsMap[row.booking_id].seats.push({
        id: row.seat_id,
        number: row.seat_number,
        is_handi: row.seat_is_handi,
        is_available: true,
      });
    }

    for (const bookingId in bookingsMap) {
      const screeningId = rows.find(
        (row: any) => row.booking_id === parseInt(bookingId)
      )?.screening_id;

      const screening = await fetchScreeningById(screeningId);
      if (screening) {
        bookingsMap[bookingId].screening = screening;
        bookingsMap[bookingId].endTime = new Date(screening.end_time);
      }
    }

    const now = new Date();
    const openBookings = [];
    const closedBookings = [];

    for (const bookingId in bookingsMap) {
      const booking = bookingsMap[bookingId];
      if (booking.endTime && booking.endTime > now) {
        openBookings.push(booking);
      } else {
        closedBookings.push(booking);
      }
    }

    const statuses = await fetchStatuses();

    res.json({ openBookings, closedBookings, statuses });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
