const mariadbService = require("../../services/mariadb.service");

const getCinemaById = async (req, res) => {
  const cinemaId = req.params.id;

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
    const rows = await mariadbService.query(
      "SELECT * FROM cinema WHERE cinema.id = ?",
      [cinemaId]
    );

    if (rows.length === 0) {
      return null;
    }

    const openings = await fetchOpeningsByCinemaId(cinemaId);

    const cinema = {
      id: rows[0].id,
      name: rows[0].name,
      address: rows[0].address,
      city: rows[0].city,
      postcode: rows[0].postcode,
      phone: rows[0].phone,
      opening_hours: openings.map((opening) => ({
        day_of_week: opening.day_of_week,
        opening_time: opening.opening_time,
        closing_time: opening.closing_time,
      })),
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
    const rows = await mariadbService.query(`SELECT * FROM cinema`);

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
    const rows = await mariadbService.query(
      `SELECT
        c.id AS cinema_id,
        c.name AS cinema_name,
        c.address AS cinema_address,
        c.city AS cinema_city,
        c.postcode AS cinema_postcode,
        c.phone AS cinema_phone
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
    };
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération du cinéma: ${error.message}`
    );
  }
};

const fetchOpeningsByCinemaId = async (cinema_id) => {
  if (!cinema_id) {
    return res.status(400).json({
      message: "Veuillez renseigner un id de cinéma",
    });
  }

  try {
    const openings = await mariadbService.query(
      `SELECT 
        c.name AS cinema_name,
        oh.day_of_week,
        oh.opening_time,
        oh.closing_time
      FROM 
        cinema c
      INNER JOIN 
        cinema_opening_hours oh ON c.id = oh.cinema_id
      WHERE cinema_id = ?`,
      [cinema_id]
    );

    return openings;
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des horaires d'ouverture",
    });
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
