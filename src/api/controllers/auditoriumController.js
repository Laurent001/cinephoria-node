const dbService = require("../../services/database.service");

const getAuditoriums = async (req, res) => {
  try {
    const rows = await dbService.query(`SELECT * FROM auditorium`);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des auditoriums",
      error: error.message,
    });
  }
};

const fetchAuditoriums = async () => {
  try {
    const rows = await dbService.query(`SELECT * FROM auditorium`);
    return rows;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des auditoriums");
  }
};

module.exports = {
  getAuditoriums,
  fetchAuditoriums,
};
