const dbService = require("../../services/database.service");

const getGenres = async (req, res) => {
  try {
    const rows = await dbService.query(`SELECT * FROM genre`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des genres",
      error: error.message,
    });
  }
};

module.exports = {
  getGenres,
};
