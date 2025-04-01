const mariadbService = require("../../services/mariadb.service");

const getOpeningsByCinemaId = async (req, res) => {
  const cinema_id = req.params.id;

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

    res.status(200).json(openings);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des horaires d'ouverture",
    });
  }
};

module.exports = {
  getOpeningsByCinemaId,
};
