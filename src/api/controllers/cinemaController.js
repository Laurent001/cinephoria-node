const dbService = require("../../services/database.service");

const getCinemas = async (req, res) => {
  try {
    const rows = await dbService.query(`SELECT * FROM cinema`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des cinemas",
      error: error.message,
    });
  }
};

module.exports = {
  getCinemas,
};
