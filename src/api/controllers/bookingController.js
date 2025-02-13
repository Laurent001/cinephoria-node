const dbService = require("../../services/database.service");

//todo: à tester
const getBookingsByUserId = async (req, res) => {
  const userId = req.params.id;
  try {
    const rows = await dbService.query(
      `SELECT 
        b.added_date, 
        b.user_id, 
        s.number AS seat_number, 
        s.is_handicap, 
        s.id, 
        s.auditorium_id, 
        a.name, 
        a.cinema_id, 
        a.quality_id, 
        c.address, 
        c.city, 
        c.name, 
        c.opening_hours, 
        c.phone, 
        c.postcode 
      FROM 
        booking b 
        INNER JOIN booking_screening_seat bsc ON bsc.booking_id = b.id 
        INNER JOIN seat s ON s.id = bsc.seat_id 
        INNER JOIN auditorium a ON a.id = s.auditorium_id 
        INNER JOIN cinema c ON c.id = a.cinema_id 
      WHERE 
        b.user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
  }
};

const createBooking = async (req, res) => {
  const { user, screening, totalPrice, seats } = req.body;

  try {
    const result = await dbService.executeTransaction(async () => {
      const bookingResult = await dbService.query(
        "INSERT INTO booking (user_id, total_price) VALUES (?, ?)",
        [user.id, totalPrice]
      );

      const bookingId = bookingResult.insertId.toString();
      const seatValues = seats
        .map((seat) => `(${bookingId}, ${seat.id}, ${screening.id})`)
        .join(", ");

      await dbService.query(
        `INSERT INTO booking_screening_seat (booking_id, seat_id, screening_id) VALUES ${seatValues}`
      );

      return { bookingId };
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
    const rows = await dbService.query(
      `SELECT DISTINCT 
        sc.id AS screening_id, 
        sc.start_time, 
        sc.end_time, 
        se.id AS seat_id, 
        se.number AS seat_number, 
        se.is_handi, 
        a.name AS auditorium_name, 
        a.cinema_id AS auditorium_cinema_id, 
        a.handi_seat AS auditorium_handi_seat,
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
      auditorium_handi_seat: rows[0].handi_seat,
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

module.exports = {
  getBookingsByUserId,
  getSeatsByScreeningId,
  createBooking,
};
