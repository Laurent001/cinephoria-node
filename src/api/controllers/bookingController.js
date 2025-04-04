const mariadbService = require("../../services/mariadb.service");
const mongodbService = require("../../services/mongodb.service");

const getBookingsByUserId = async (req, res) => {
  const userId = req.params.id;
  try {
    const bookings = await fetchBookingsByUserId(userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
  }
};

const fetchBookingsByUserId = async (userId) => {
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

const createBooking = async (req, res) => {
  const { user, screening, totalPrice, seats } = req.body;
  const bookedSeats = seats.filter((seat) => seat.is_handi === 0).length;
  const bookedHandiSeats = seats.filter((seat) => seat.is_handi === 1).length;
  
  try {
    const result = await mariadbService.executeTransaction(async () => {
      const bookingResult = await mariadbService.query(
        "INSERT INTO booking (user_id, total_price) VALUES (?, ?)",
        [user.id, totalPrice]
      );

      const [currentScreening] = await mariadbService.query(
        "SELECT remaining_seat, remaining_seat_handi FROM screening WHERE id = ?",
        [screening.id]
      );

      const newRemainingSeat = currentScreening.remaining_seat - bookedSeats;
      const newRemainingHandiSeat =
        currentScreening.remaining_seat_handi - bookedHandiSeats;
      await mariadbService.query(
        "UPDATE screening SET remaining_seat = ?, remaining_seat_handi = ? WHERE id = ?",
        [newRemainingSeat, newRemainingHandiSeat, screening.id]
      );

      const booking_id = bookingResult.insertId.toString();

      await mongodbService.insertBookingAnalytics({
        booking_id,
        user_id: user.id,
        film_id: screening.film.id,
        film_title: screening.film.title,
      });

      const seatValues = seats
        .map((seat) => `(${booking_id}, ${seat.id}, ${screening.id})`)
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
    console.error("Erreur lors de l'exécution de la transaction :", error);
    res.status(500).json({
      message: "Erreur lors de la création de la réservation",
      error: error.message,
    });
  }
};

const getSeatsByScreeningId = async (req, res) => {
  const screeningId = req.params.id;

  try {
    const rows = await mariadbService.query(
      `SELECT DISTINCT 
        sc.id AS screening_id, 
        sc.start_time, 
        sc.end_time, 
        se.id AS seat_id, 
        se.number AS seat_number, 
        se.is_handi, 
        a.name AS auditorium_name, 
        a.cinema_id AS auditorium_cinema_id, 
        a.seat_handi AS auditorium_seat_handi,
        a.seat AS auditorium_seat,
        q.name AS auditorium_quality,
        q.price AS auditorium_price,
        CASE 
          WHEN bsc.seat_id IS NULL THEN TRUE
          ELSE FALSE 
        END AS is_available 
      FROM 
        screening sc 
        INNER JOIN auditorium a ON a.id = sc.auditorium_id 
        INNER JOIN seat se ON se.auditorium_id = a.id 
        LEFT JOIN booking_screening_seat bsc ON bsc.seat_id = se.id AND bsc.screening_id = sc.id
        INNER JOIN quality q ON q.id = a.quality_id
      WHERE 
        sc.id = ?`,
      [screeningId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Film ou séances non trouvé(es)" });
    }

    const screening = {
      id: rows[0].screening_id,
      start_time: rows[0].start_time,
      end_time: rows[0].end_time,
      auditorium_name: rows[0].name,
      auditorium_seat: rows[0].seat,
      auditorium_seat_handi: rows[0].seat_handi,
      auditorium_cinema_id: rows[0].auditorium_cinema_id,
      auditorium_quality: rows[0].auditorium_quality,
      auditorium_price: rows[0].auditorium_price,
    };

    const seats = rows.map((row) => ({
      id: row.seat_id,
      number: row.seat_number,
      is_handi: row.is_handi,
      is_available: row.is_available,
    }));

    res.json({
      screening,
      seats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
  }
};

const deleteBookingById = async (req, res) => {
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

const getLast7DaysBookingsByFilmId = async (req, res) => {
  const { filmId } = req.params;

  try {
    await mongodbService.connect();
    const collection = mongodbService.db.collection("bookings_analytics");

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

module.exports = {
  getBookingsByUserId,
  fetchBookingsByUserId,
  getSeatsByScreeningId,
  createBooking,
  deleteBookingById,
  getLast7DaysBookingsByFilmId,
};
