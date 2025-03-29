const mariadbService = require("../../services/mariadb.service");
const cinemaController = require("../controllers/cinemaController");
const { fetchCinemaById } = require("./cinemaController");
const { fetchQualityById } = require("./qualityController");

const getAuditoriumById = async (req, res) => {
  try {
    const auditoriumId = req.params.id;
    const auditorium = await fetchAuditoriumById(auditoriumId);

    if (!auditorium) {
      return res.status(404).json({ message: "Aucun auditorium trouvé" });
    }

    res.json(auditorium);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'auditorium",
      error: error.message,
    });
  }
};

const fetchAuditoriumById = async (auditoriumId) => {
  try {
    const rows = await mariadbService.query(
      `SELECT
        a.id,
        a.cinema_id,
        a.quality_id,
        a.name,
        a.seat,
        a.seat_handi
      FROM auditorium a
      WHERE a.id = ?`,
      [auditoriumId]
    );

    if (rows.length === 0) {
      return null;
    }

    const auditorium = {
      id: rows[0].id,
      name: rows[0].name,
      seat: rows[0].seat,
      seat_handi: rows[0].seat_handi,
      cinema: await fetchCinemaById(rows[0].cinema_id),
      quality: await fetchQualityById(rows[0].quality_id),
    };

    return auditorium;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de l'auditorium: ${error.message}`
    );
  }
};

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
  return await mariadbService.executeTransaction(async () => {
    const rows = await mariadbService.query(
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
    const qualities = await mariadbService.query(`SELECT * FROM quality`);

    return { auditoriums, cinemas, qualities };
  });
};

const updateAuditorium = async (req, res) => {
  const {
    id,
    name,
    seat,
    seat_handi,
    quality: { id: qualityId },
    cinema: { id: cinemaId },
  } = req.body;

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(
        `UPDATE auditorium
        SET
          name = ?,
          seat = ?,
          seat_handi = ?,
          quality_id = ?,
          cinema_id = ?
        WHERE id = ?`,
        [name, seat, seat_handi, qualityId, cinemaId, id]
      );

      return await fetchAuditoriums();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout' de la séance",
      error: error.message,
    });
  }
};

const addAuditorium = async (req, res) => {
  const {
    id,
    name,
    seat,
    seat_handi,
    quality: { id: qualityId },
    cinema: { id: cinemaId },
  } = req.body;

  if (id !== undefined) return res.status(500).json({ message: "id defined" });

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(
        `INSERT INTO auditorium (name, seat, seat_handi, quality_id, cinema_id) VALUES (?,?,?,?,?)`,
        [name, seat, seat_handi, qualityId, cinemaId]
      );
      return await fetchAuditoriums();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout' de la salle",
      error: error.message,
    });
  }
};

const deleteAuditoriumById = async (req, res) => {
  const auditoriumId = req.params.id;

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(`DELETE FROM auditorium WHERE id = ?`, [
        auditoriumId,
      ]);
      return await fetchAuditoriums();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la séance",
      error: error.message,
    });
  }
};

module.exports = {
  getAuditoriumById,
  fetchAuditoriumById,
  getAuditoriums,
  fetchAuditoriums,
  updateAuditorium,
  addAuditorium,
  deleteAuditoriumById,
};
