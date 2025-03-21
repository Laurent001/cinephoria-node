const dbService = require("../../services/database.service");
const { fetchUserById } = require("./userController");
const { fetchFilmById } = require("./filmController");
const { fetchStatuses, fetchStatusById } = require("./statusController");

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
          status: opinion[0].status_id,
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

const getOpinions = async (req, res) => {
  try {
    const rows = await fetchOpinions();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des avis",
      error: error.message,
    });
  }
};

const fetchOpinions = async () => {
  try {
    const result = await dbService.executeTransaction(async (connection) => {
      const rows = await connection.query("SELECT * FROM opinion");

      if (rows.length === 0) {
        return undefined;
      }

      const opinions = await Promise.all(
        rows.map(async (opinion) => {
          const user = await fetchUserById(opinion.user_id);
          const film = await fetchFilmById(opinion.film_id);
          const status = await fetchStatusById(opinion.status_id);
          return {
            id: opinion.id,
            rating: opinion.rating,
            description: opinion.description,
            added_date: opinion.added_date,
            status: status,
            user: user,
            film: film,
          };
        })
      );
      const statuses = await fetchStatuses();
      return { opinions, statuses };
    });

    return result;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des avis: ${error.message}`
    );
  }
};

const addOpinion = async (req, res) => {
  const { user, film, rating, description, status } = req.body;

  try {
    const result = await dbService.executeTransaction(async (connection) => {
      const opinion = await connection.query(
        "INSERT INTO opinion (user_id, film_id, rating, description, status_id) VALUES (?, ?, ?, ?, ?)",
        [user.id, film.id, rating, description, status.id]
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

const updateOpinionStatus = async (req, res) => {
  const { id, status } = req.body;

  try {
    const result = await dbService.query(
      "UPDATE opinion SET status_id = ? WHERE id = ?",
      [status.id, id]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ message: "Avis mis à jour" });
    } else {
      res.status(500).json({ message: "Avis non trouvé" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'avis",
      error: error.message,
    });
  }
};

const updateOpinion = async (req, res) => {
  const { id, status, description, rating } = req.body;

  try {
    const result = await dbService.query(
      "UPDATE opinion SET status_id = ?, description = ?, rating = ? WHERE id = ?",
      [status.id, description, rating, id]
    );

    if (result.affectedRows > 0) {
      res.status(201).json({ message: "Avis mis à jour" });
    } else {
      res.status(500).json({ message: "Avis non trouvé" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'avis",
      error: error.message,
    });
  }
};

const deleteOpinionById = async (req, res) => {
  const opinionId = req.params.id;

  try {
    const result = await dbService.query(`DELETE FROM opinion WHERE id = ?`, [
      opinionId,
    ]);

    if (result.affectedRows > 0) {
      res.status(200).json(true);
    } else {
      res.status(404).json(false);
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    res.status(500).json(false);
  }
};

module.exports = {
  getOpinionByUserIdAndFilmId,
  fetchOpinionByUserIdAndFilmId,
  getOpinions,
  fetchOpinions,
  addOpinion,
  updateOpinionStatus,
  updateOpinion,
  deleteOpinionById,
};
