const dbService = require("../../services/database.service");

const getMaterials = async (req, res) => {
  try {
    const rows = await dbService.query(`SELECT * FROM material`);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des matériels",
      error: error.message,
    });
  }
};

const fetchMaterials = async () => {
  try {
    const rows = await dbService.query(`SELECT * FROM material`);
    return rows;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des matériels");
  }
};

module.exports = {
  getMaterials,
  fetchMaterials,
};
