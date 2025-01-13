const dbService = require("../../services/database.service");

const getFilms = async (req, res) => {
  try {
    const rows = await dbService.query("SELECT * FROM film");
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message,
    });
  }
};

module.exports = {
  getFilms,
};
