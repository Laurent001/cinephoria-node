import { Request, Response } from "express";
import mariadbService from "../../services/mariadb.service.js";
import mongodbService from "../../services/mongodb.service.js";
import { getErrorMessage } from "../../utils/error.js";
import { fetchQRCodeByBookingId } from "../controllers/qrcodeController.js";
import { Seat } from "../../interfaces/seat.js";
import { Screening } from "../../interfaces/screening.js";

const getBookingsByUserId = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  try {
    const bookings = await fetchBookingsByUserId(userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: getErrorMessage(error),
    });
  }
};

const fetchBookingsByUserId = async (userId: number) => {
  return await mariadbService.query(
    `SELECT 
      b.id AS booking_id, 
      b.user_id AS booking_user_id, 
      b.added_date AS booking_added_date, 
      b.total_price AS booking_total_price, 
      s.number AS seat_number, 
      s.is_handi AS seat_is_handi, 
      s.id AS seat_id, 
      s.auditorium_id AS seat_auditorium_id, 
      sc.id AS screening_id, 
      a.name AS auditorium_name, 
      a.cinema_id AS auditorium_cinema_id, 
      a.quality_id AS auditorium_quality_id, 
      c.address AS cinema_address,
      c.city AS cinema_city,
      c.name AS cinema_name,
      c.phone AS cinema_phone,
      c.postcode AS cinema_postcode, 
      f.id AS film_id
    FROM 
      booking b 
      INNER JOIN booking_screening_seat bsc ON bsc.booking_id = b.id 
      INNER JOIN seat s ON s.id = bsc.seat_id 
      INNER JOIN screening sc ON sc.id = bsc.screening_id
      INNER JOIN film f ON f.id = sc.film_id
      INNER JOIN auditorium a ON a.id = s.auditorium_id          
      INNER JOIN cinema c ON c.id = a.cinema_id 
    WHERE 
      b.user_id = ?`,
    [userId]
  );
};

const createBooking = async (req: Request, res: Response) => {
  const { user, screening, totalPrice, seats } = req.body;

  // Comptage des sièges classiques et PMR
  const bookedSeats = seats.filter((seat: any) => seat.is_handi === 0).length;
  const bookedHandiSeats = seats.filter(
    (seat: any) => seat.is_handi === 1
  ).length;

  try {
    const result = await mariadbService.executeTransaction(async () => {
      // Création de la réservation
      const bookingResult = await mariadbService.query(
        "INSERT INTO booking (user_id, total_price) VALUES (?, ?)",
        [user.id, totalPrice]
      );
      const booking_id = bookingResult.insertId.toString();

      // Génération du QR code associé
      const qrcode = await fetchQRCodeByBookingId(booking_id);
      if (qrcode) {
        const response = await updateBookingQRCode(booking_id, qrcode.token);
        if (!response)
          throw new Error("Erreur lors de la mise à jour du QR code");
      }

      // Récupération de la séance actuelle
      const [currentScreening] = await mariadbService.query(
        "SELECT remaining_seat, remaining_seat_handi FROM screening WHERE id = ?",
        [screening.id]
      );

      // Mise à jour du nombre de sièges restants
      const newRemainingSeat = currentScreening.remaining_seat - bookedSeats;
      const newRemainingHandiSeat =
        currentScreening.remaining_seat_handi - bookedHandiSeats;
      await mariadbService.query(
        "UPDATE screening SET remaining_seat = ?, remaining_seat_handi = ? WHERE id = ?",
        [newRemainingSeat, newRemainingHandiSeat, screening.id]
      );

      // Stockage des données analytiques dans MongoDB
      await mongodbService.insertBookingAnalytics({
        booking_id,
        user_id: user.id,
        film_id: screening.film.id,
        film_title: screening.film.title,
      });

      // Association des sièges à la réservation
      const seatValues = seats
        .map((seat: any) => `(${booking_id}, ${seat.id}, ${screening.id})`)
        .join(", ");
      await mariadbService.query(
        `INSERT INTO booking_screening_seat (booking_id, seat_id, screening_id) VALUES ${seatValues}`
      );

      return { booking_id };
    });

    res.status(201).json({
      message: "Réservation créée avec succès",
      bookingId: result.bookingId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de la réservation",
      error: getErrorMessage(error),
    });
  }
};

const updateBookingQRCode = async (bookingId: number, qrcode: string) => {
  try {
    const result = await mariadbService.query(
      `UPDATE booking SET qrcode = ? WHERE id = ?`,
      [qrcode, bookingId]
    );
    if (result.affectedRows > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(
      `Erreur lors de la mise à jour du QR code: ${getErrorMessage(error)}`
    );
  }
};

const deleteBookingById = async (req: Request, res: Response) => {
  const bookingId = req.params.id;

  try {
    const result = await mariadbService.query(
      `DELETE FROM booking WHERE id = ?`,
      [bookingId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json(true);
    } else {
      res.status(404).json(false);
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    res.status(500).json(false);
  }
};

const getLast7DaysBookingsByFilmId = async (req: Request, res: Response) => {
  const { filmId } = req.params;

  try {
    await mongodbService.connect();

    const collection = mongodbService
      .getDatabase()
      .collection("bookings_analytics");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
    sevenDaysAgo.setUTCHours(0, 0, 0, 0);

    const query = {
      film_id: parseInt(filmId, 10),
      timestamp: { $gte: sevenDaysAgo },
    };

    const data = await collection.find(query).toArray();

    res.json(data);
  } catch (error) {
    console.error("Error fetching booking analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await mongodbService.close();
  }
};

export {
  createBooking,
  deleteBookingById,
  fetchBookingsByUserId,
  getBookingsByUserId,
  getLast7DaysBookingsByFilmId,
  getSeatsByScreeningId,
  updateBookingQRCode,
};
