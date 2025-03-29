const mariadbService = require("../../services/mariadb.service");

const getQualityById = async (req, res) => {
  try {
    const qualityId = req.params.id;
    const quality = await fetchQualityById(qualityId);

    if (!quality) {
      return res.status(404).json({ message: "Aucune qualité trouvé" });
    }

    res.json(quality);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'quality",
      error: error.message,
    });
  }
};

const fetchQualityById = async (qualityId) => {
  try {
    const rows = await mariadbService.query(
      `SELECT * FROM quality q
      WHERE q.id = ?`,
      [qualityId]
    );

    if (rows.length === 0) {
      return null;
    }

    const quality = {
      id: rows[0].id,
      name: rows[0].name,
      price: rows[0].price,
    };

    return quality;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de la qualité: ${error.message}`
    );
  }
};

module.exports = {
  getQualityById,
  fetchQualityById,
};
