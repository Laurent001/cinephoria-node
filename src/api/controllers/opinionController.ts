import { Request, Response } from "express";
import type { PoolConnection } from "mariadb";
import mariadbService from "../../services/mariadb.service.js";
import { getErrorMessage } from "../../utils/error.js";
import { fetchFilmById } from "./filmController.js";
import { fetchStatusById, fetchStatuses } from "./statusController.js";
import { fetchUserById } from "./userController.js";

const STATUS_PUBLISHED = 1;

const getOpinionByUserIdAndFilmId = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const filmId = parseInt(req.params.filmId, 10);
  try {
    const rows = await fetchOpinionByUserIdAndFilmId(userId, filmId);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des avis",
      error: getErrorMessage(error),
    });
  }
};
const fetchOpinionByUserIdAndFilmId = async (
  userId: number,
  filmId: number
) => {
  try {
    const opinionResponse = await mariadbService.executeTransaction(
      async (connection: PoolConnection) => {
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
      `Erreur lors de la récupération des avis : ${getErrorMessage(error)}`
    );
  }
};

const getOpinions = async (req: Request, res: Response) => {
  try {
    const rows = await fetchOpinions();
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des avis",
      error: getErrorMessage(error),
    });
  }
};

const fetchOpinions = async () => {
  try {
    const result = await mariadbService.executeTransaction(
      async (connection: PoolConnection) => {
        const rows = await connection.query("SELECT * FROM opinion");

        if (rows.length === 0) {
          return undefined;
        }

        const opinionsArray = await Promise.all(
          rows.map(async (opinion: any) => {
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

        const opinions = opinionsArray.sort(
          (a: { added_date: Date }, b: { added_date: Date }) =>
            a.added_date.getTime() - b.added_date.getTime()
        );

        const statuses = await fetchStatuses();
        return { opinions, statuses };
      }
    );

    return result;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des avis : ${getErrorMessage(error)}`
    );
  }
};

const addOpinion = async (req: Request, res: Response) => {
  const { user, film, rating, description, status } = req.body;

  try {
    const result = await mariadbService.executeTransaction(
      async (connection: PoolConnection) => {
        const opinion = await connection.query(
          "INSERT INTO opinion (user_id, film_id, rating, description, status_id) VALUES (?, ?, ?, ?, ?)",
          [user.id, film.id, rating, description, status.id]
        );

        const insertedId = opinion.insertId;
        return Number(insertedId);
      }
    );

    res.status(201).json({ message: "avis ajouté", opinionId: result });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout de l'avis",
      error: getErrorMessage(error),
    });
  }
};

const updateOpinionStatus = async (req: Request, res: Response) => {
  const { id, status } = req.body;

  try {
    const result = await mariadbService.executeTransaction(async () => {
      const opinionUpdate = await mariadbService.query(
        "UPDATE opinion SET status_id = ? WHERE id = ?",
        [status.id, id]
      );
      console.log("opinionUpdate : ", opinionUpdate);
      if (opinionUpdate.affectedRows <= 0) {
        res.status(500).json({ message: "Avis non trouvé" });
      }

      const film = await mariadbService.query(
        `SELECT film_id FROM opinion WHERE id = ?`,
        [id]
      );

      if (film.length === 0) {
        res.status(500).json({ message: "film non trouvé pour cette opinion" });
      }

      const filmId = film[0].film_id;
      const rows = await mariadbService.query(
        `SELECT AVG(rating) AS average_rating FROM opinion WHERE film_id = ? AND status_id = ?`,
        [filmId, STATUS_PUBLISHED]
      );

      const averageRating = rows[0].average_rating;

      const ratingUpdate = await mariadbService.query(
        `UPDATE film SET rating = ? WHERE id = ?`,
        [averageRating, filmId]
      );

      if (ratingUpdate.affectedRows <= 0) {
        res.status(500).json({ message: "Note non mise à jour" });
      }
    });
    if (status.id === STATUS_PUBLISHED) {
      res.status(201).json({
        message: "Statut de l'avis et note mis à jour",
      });
    } else {
      res.status(201).json({ message: "Statut de l'avis mis à jour" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'avis",
      error: getErrorMessage(error),
    });
  }
};

const updateOpinion = async (req: Request, res: Response) => {
  const { id, status, description, rating } = req.body;

  try {
    const result = await mariadbService.query(
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
      error: getErrorMessage(error),
    });
  }
};

const deleteOpinionById = async (req: Request, res: Response) => {
  const opinionId = req.params.id;

  try {
    const result = await mariadbService.query(
      `DELETE FROM opinion WHERE id = ?`,
      [opinionId]
    );

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

export {
  addOpinion,
  deleteOpinionById,
  fetchOpinionByUserIdAndFilmId,
  fetchOpinions,
  getOpinionByUserIdAndFilmId,
  getOpinions,
  updateOpinion,
  updateOpinionStatus,
};
