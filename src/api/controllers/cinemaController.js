const dbService = require("../../services/database.service");

const getCinemaById = async (req, res) => {
  const cinemaId = req.cinema.id;

  try {
    const cinema = await fetchCinemaById(cinemaId);

    if (!cinema) {
      return res.status(404).json({ message: "Cinéma non trouvé" });
    }

    res.json(cinema);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du cinéma",
      error: error.message,
    });
  }
};

const fetchCinemaById = async (cinemaId) => {
  try {
    const rows = await dbService.query(
      "SELECT * FROM cinema WHERE cinema.id = ?",
      [cinemaId]
    );

    if (rows.length === 0) {
      return null;
    }

    const cinema = {
      id: rows[0].id,
      name: rows[0].name,
      address: rows[0].address,
      city: rows[0].city,
      postcode: rows[0].postcode,
      phone: rows[0].phone,
      opening_hours: rows[0].opening_hours,
    };

    return cinema;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de l'utilisateur: ${error.message}`
    );
  }
};

const getCinemas = async (req, res) => {
  try {
    const rows = await fetchCinemas();

    if (rows.length === 0) {
      res.json({ message: "Aucun cinéma trouvé" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des cinemas",
      error: error.message,
    });
  }
};

const fetchCinemas = async () => {
  try {
    const rows = await dbService.query(`SELECT * FROM cinema`);

    if (rows.length === 0) {
      return [];
    }

    return rows;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des cinemas: ${error.message}`
    );
  }
};

const getCinemaByScreeningId = async (req, res) => {
  const screeningId = req.params.id;
  try {
    const cinema = await fetchCinemaByScreeningId(screeningId);

    if (!cinema) {
      return res
        .status(404)
        .json({ message: "Cinéma du screening non trouvé" });
    }

    res.json(cinema);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du cinéma",
      error: error.message,
    });
  }
};

const fetchCinemaByScreeningId = async (screeningId) => {
  try {
    const rows = await dbService.query(
      `SELECT
        c.id AS cinema_id,
        c.name AS cinema_name,
        c.address AS cinema_address,
        c.city AS cinema_city,
        c.postcode AS cinema_postcode,
        c.phone AS cinema_phone,
        c.opening_hours AS cinema_opening_hours
      FROM
        screening s
        INNER JOIN auditorium a ON a.id = s.auditorium_id
        INNER JOIN cinema c ON c.id = a.cinema_id
      WHERE
        s.id = ?`,
      [screeningId]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].cinema_id,
      name: rows[0].cinema_name,
      address: rows[0].cinema_address,
      city: rows[0].cinema_city,
      postcode: rows[0].cinema_postcode,
      phone: rows[0].cinema_phone,
      opening_hours: rows[0].cinema_opening_hours,
    };
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération du cinéma: ${error.message}`
    );
  }
};

module.exports = {
  fetchCinemaById,
  getCinemaById,
  getCinemas,
  fetchCinemas,
  getCinemaByScreeningId,
  fetchCinemaByScreeningId,
};
