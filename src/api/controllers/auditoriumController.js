const dbService = require("../../services/database.service");
const cinemaController = require("../controllers/cinemaController");

const getAuditoriums = async (req, res) => {
  try {
    const result = await fetchAuditoriums();

    if (result.length === 0) {
      return res.status(404).json({ message: "Salle(s) non trouvée(s)" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des auditoriums",
      error: error.message,
    });
  }
};

const fetchAuditoriums = async () => {
  return await dbService.executeTransaction(async () => {
    const rows = await dbService.query(
      `SELECT 
        a.id, 
        a.name, 
        a.seat_handi, 
        a.seat, 
        q.id AS quality_id,
        q.name AS quality_name,
        q.price AS quality_price,
        c.id AS cinema_id,
        c.name AS cinema_name,
        c.address AS cinema_address,
        c.city AS cinema_city,
        c.postcode AS cinema_postcode,
        c.phone AS cinema_phone,
        c.opening_hours AS cinema_opening_hours
      FROM
        auditorium a
        INNER JOIN quality q ON a.quality_id = q.id
        INNER JOIN cinema c ON a.cinema_id = c.id`
    );

    if (rows.length === 0) {
      return [];
    }

    const auditoriums = rows.map((row) => ({
      id: row.id,
      name: row.name,
      seat_handi: row.seat_handi,
      seat: row.seat,
      quality: {
        id: row.quality_id,
        name: row.quality_name,
        price: row.quality_price,
      },
      cinema: {
        id: row.cinema_id,
        name: row.cinema_name,
        address: row.cinema_address,
        city: row.cinema_city,
        postcode: row.cinema_postcode,
        phone: row.cinema_phone,
        opening_hours: row.cinema_opening_hours,
      },
    }));

    const cinemas = await cinemaController.fetchCinemas();
    const qualities = await dbService.query(`SELECT * FROM quality`);

    return { auditoriums, cinemas, qualities };
  });
};

// const updateScreening = async (req, res) => {
//   const {
//     locale,
//     screening: { id, start_time, end_time, film, auditorium },
//   } = req.body;

//   const formatted_start_time = moment(start_time)
//     .tz(locale)
//     .format("YYYY-MM-DD HH:mm:ss");

//   const formatted_end_time = moment(end_time)
//     .tz(locale)
//     .format("YYYY-MM-DD HH:mm:ss");

//   try {
//     const result = await dbService.executeTransaction(async () => {
//       await dbService.query(
//         `UPDATE screening
//         SET
//           start_time = ?,
//           end_time = ?,
//           film_id = ?,
//           auditorium_id = ?
//         WHERE id = ?`,
//         [formatted_start_time, formatted_end_time, film.id, auditorium.id, id]
//       );

//       return await fetchScreenings();
//     });
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({
//       message: "Erreur lors de l'ajout' de la séance",
//       error: error.message,
//     });
//   }
// };

// const addScreening = async (req, res) => {
//   const { id, start_time, end_time, film, auditorium } = req.body;
//   const formatted_start_time = new Date(start_time)
//     .toISOString()
//     .slice(0, 19)
//     .replace("T", " ");
//   const formatted_end_time = new Date(end_time)
//     .toISOString()
//     .slice(0, 19)
//     .replace("T", " ");

//   if (id !== undefined) return res.status(500).json({ message: "id defined" });

//   try {
//     const result = await dbService.executeTransaction(async () => {
//       const row = await dbService.query(
//         `SELECT seat, seat_handi from auditorium WHERE id = ?`,
//         [auditorium.id]
//       );

//       const remaining_seat = row[0].seat;
//       const remaining_seat_handi = row[0].seat_handi;

//       await dbService.query(
//         `INSERT INTO screening (start_time, end_time, remaining_seat, remaining_seat_handi, film_id, auditorium_id) VALUES (?,?,?,?,?,?)`,
//         [
//           formatted_start_time,
//           formatted_end_time,
//           remaining_seat,
//           remaining_seat_handi,
//           film.id,
//           auditorium.id,
//         ]
//       );
//       return await fetchScreenings();
//     });
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({
//       message: "Erreur lors de l'ajout' de la séance",
//       error: error.message,
//     });
//   }
// };

// const deleteScreeningById = async (req, res) => {
//   const screeningId = req.params.id;

//   try {
//     const result = await dbService.executeTransaction(async () => {
//       await dbService.query(`DELETE FROM screening WHERE id = ?`, [
//         screeningId,
//       ]);
//       return await fetchScreenings();
//     });
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({
//       message: "Erreur lors de la suppression de la séance",
//       error: error.message,
//     });
//   }
// };

module.exports = {
  getAuditoriums,
  fetchAuditoriums,
};
