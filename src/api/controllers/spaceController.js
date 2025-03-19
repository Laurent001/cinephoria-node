const { fetchBookingsByUserId } = require("./bookingController");
const { fetchScreeningById } = require("./screeningController");
const { fetchUserById } = require("./userController");
const { fetchOpinionByUserIdAndFilmId } = require("./opinionController");

const getSpaceByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    const rows = await fetchBookingsByUserId(userId);
    // sièges par booking_id
    const bookingsMap = {};
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
        (row) => row.booking_id === parseInt(bookingId)
      ).screening_id;
      const screening = await fetchScreeningById(screeningId);

      bookingsMap[bookingId].screening = screening;
      bookingsMap[bookingId].endTime = new Date(screening.end_time);
    }

    const now = new Date();
    const openBookings = [];
    const closedBookings = [];
    for (const bookingId in bookingsMap) {
      const booking = bookingsMap[bookingId];
      if (booking.endTime > now) {
        openBookings.push(booking);
      } else {
        closedBookings.push(booking);
      }
    }

    res.json({ openBookings, closedBookings });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations",
      error: error.message,
    });
  }
};

module.exports = {
  getSpaceByUserId,
};
