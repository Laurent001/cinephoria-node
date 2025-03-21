const dbService = require("../../services/database.service");

const fetchStatuses = async () => {
  try {
    const rows = await dbService.query(`SELECT * FROM status`);
    return rows;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des status: ${error.message}`
    );
  }
};

const getStatuses = async (req, res) => {
  try {
    const rows = await fetchStatuses();
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des status",
      error: error.message,
    });
  }
};

const getStatusById = async (req, res) => {
  try {
    const statusId = req.params.id;
    const status = await fetchStatusById(statusId);

    if (!status) {
      return res.status(404).json({ message: "Aucun status trouvé" });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du status",
      error: error.message,
    });
  }
};

const fetchStatusById = async (statusId) => {
  try {
    const rows = await dbService.query(
      `SELECT * FROM status q
      WHERE q.id = ?`,
      [statusId]
    );

    if (rows.length === 0) {
      return null;
    }

    const status = {
      id: rows[0].id,
      name: rows[0].name,
    };

    return status;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération du status: ${error.message}`
    );
  }
};

module.exports = {
  getStatuses,
  fetchStatuses,
  getStatusById,
  fetchStatusById,
};
