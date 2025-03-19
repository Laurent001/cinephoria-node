const dbService = require("../../services/database.service");

const getOpinionByUserIdAndFilmId = async (req, res) => {
  const userId = req.params.userId;
  const filmId = req.params.filmId;
  try {
    const rows = await fetchOpinionByUserIdAndFilmId(userId, filmId);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des avis",
      error: error.message,
    });
  }
};

const fetchOpinionByUserIdAndFilmId = async (userId, filmId) => {
  try {
    const opinionResponse = await dbService.executeTransaction(
      async (connection) => {
        const opinion = await connection.query(
          "SELECT * FROM opinion WHERE user_id = ? AND film_id = ?",
          [userId, filmId]
        );

        if (opinion.length === 0) {
          return undefined;
        }

        const user = await connection.query("SELECT * FROM user WHERE id = ?", [
          userId,
        ]);
        const film = await connection.query("SELECT * FROM film WHERE id = ?", [
          filmId,
        ]);
        const response = {
          id: opinion[0].id,
          rating: opinion[0].rating,
          description: opinion[0].description,
          added_date: opinion[0].added_date,
          status: opinion[0].status,
          user: user,
          film: film,
        };
        return response;
      }
    );

    return opinionResponse;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des avis: ${error.message}`
    );
  }
};

const addOpinion = async (req, res) => {
  const { user, film, rating, description } = req.body;
  const status = "needs approval";

  try {
    const result = await dbService.executeTransaction(async (connection) => {
      const opinion = await connection.query(
        "INSERT INTO opinion (user_id, film_id, rating, description, status) VALUES (?, ?, ?, ?, ?)",
        [user.id, film.id, rating, description, status]
      );

      const insertedId = opinion.insertId;
      return Number(insertedId);
    });

    res.status(201).json({ message: "avis ajouté", opinionId: result });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout de l'avis",
      error: error.message,
    });
  }
};

const updateOpinion = async (req, res) => {
  const { user, film, rating, description } = req.body;

  try {
    const result = await dbService.executeTransaction(async (connection) => {
      const opinion = await connection.query(
        "UPDATE opinion SET rating = ?, description = ? WHERE user_id = ? AND film_id = ?",
        [rating, description, user[0].id, film[0].id]
      );
      return opinion;
    });
    res.status(201).json({ message: "avis mis à jour" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'avis",
      error: error.message,
    });
  }
};

module.exports = {
  getOpinionByUserIdAndFilmId,
  fetchOpinionByUserIdAndFilmId,
  addOpinion,
  updateOpinion,
};
