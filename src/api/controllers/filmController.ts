import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MulterRequest } from "../../interfaces/file.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../../services/cloudinary.service.js";
import mariadbService from "../../services/mariadb.service.js";
import { getErrorMessage } from "../../utils/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFilmById = async (req: Request, res: Response) => {
  try {
    const filmId = parseInt(req.params.id, 10);
    const film = await fetchFilmById(filmId);

    if (!film) {
      return res.status(404).json({ message: "Aucun film trouvé" });
    }

    res.json(film);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du film",
      error: getErrorMessage(error),
    });
  }
};

const fetchFilmById = async (filmId: number) => {
  try {
    const rows = await mariadbService.query(
      `SELECT
        f.id,
        f.title,
        f.description,
        f.favorite,
        f.age_minimum,
        f.poster,
        f.release_date,
        f.rating,
        GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
      FROM 
        film f
        LEFT JOIN film_genre fg ON f.id = fg.film_id 
        LEFT JOIN genre g ON fg.genre_id = g.id 
      WHERE f.id = ?`,
      [filmId]
    );

    if (rows.length === 0) {
      return null;
    }

    const film = {
      id: rows[0].id,
      title: rows[0].title,
      description: rows[0].description,
      genres: rows[0].genres,
      release_date: new Date(rows[0].release_date),
      age_minimum: rows[0].age_minimum,
      favorite: rows[0].favorite,
      poster: rows[0].poster,
      rating: rows[0].rating,
    };

    return film;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération du film: ${getErrorMessage(error)}`
    );
  }
};

const getFilms = async (req: Request, res: Response) => {
  try {
    const films = await fetchFilms();

    if (films.length === 0) {
      res.status(404).json({ message: "Film(s) non trouvé(s)" });
      return;
    }

    res.json(films);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: getErrorMessage(error),
    });
  }
};

const fetchFilms = async (conn?: any) => {
  try {
    const connection = conn || mariadbService;
    const rows = await connection.query(
      `SELECT 
        f.id, 
        f.title, 
        f.description, 
        GROUP_CONCAT(g.name SEPARATOR ', ') AS genres, 
        f.release_date, 
        f.age_minimum, 
        f.favorite, 
        f.poster, 
        f.rating
      FROM 
        film f 
        LEFT JOIN film_genre fg ON f.id = fg.film_id 
        LEFT JOIN genre g ON fg.genre_id = g.id 
      GROUP BY 
        f.id`
    );

    const films = rows.map((film: any) => ({
      ...film,
      release_date: new Date(film.release_date),
    }));

    return films;
  } catch (error) {
    console.error("Erreur dans fetchFilms:", error);
    return [];
  }
};

const getFilmsByCinemaId = async (req: Request, res: Response) => {
  const cinemaId = req.params.id;
  try {
    const rows = await mariadbService.query(
      `SELECT 
        f.id,
        f.title,
        f.description,        
        GROUP_CONCAT(g.name SEPARATOR ', ') AS genres,
        f.release_date,
        f.age_minimum,
        f.favorite,
        f.poster,
        f.rating
      FROM film f
      LEFT JOIN cinema_film cf ON f.id = cf.film_id
      LEFT JOIN cinema c ON cf.cinema_id = c.id
      LEFT JOIN film_genre fg ON f.id = fg.film_id
      LEFT JOIN genre g ON fg.genre_id = g.id
      WHERE c.id = ?
      GROUP BY 
        f.id`,
      [cinemaId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: getErrorMessage(error),
    });
  }
};

const getFilmsByGenreId = async (req: Request, res: Response) => {
  const genreId = req.params.id;
  try {
    const rows = await mariadbService.query(
      `SELECT 
        f.id,
        f.title,
        f.description,
        GROUP_CONCAT(g.name SEPARATOR ', ') AS genres,
        f.release_date,
        f.age_minimum,
        f.favorite,
        f.poster,
        f.rating
      FROM 
        film f
      LEFT JOIN 
        film_genre fg ON f.id = fg.film_id
      LEFT JOIN 
        genre g ON fg.genre_id = g.id
      WHERE 
        f.id IN (
          SELECT film_id FROM film_genre WHERE genre_id = ?
        )
      GROUP BY 
        f.id`,
      [genreId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: getErrorMessage(error),
    });
  }
};

const getFilmsByDate = async (req: Request, res: Response) => {
  const date = req.params.date;
  const start = date + " 00:00:00";
  const end = date + " 23:59:59";

  try {
    const rows = await mariadbService.query(
      `SELECT f.id, f.title, f.description, f.release_date, f.age_minimum, f.favorite, f.poster, f.rating
      FROM 
        film f
      INNER JOIN 
        screening s ON f.id = s.film_id
      WHERE 
        s.start_time > ? AND s.start_time < ?`,
      [start, end]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des screenings",
      error: getErrorMessage(error),
    });
  }
};

const updateFilm = async (req: MulterRequest, res: Response) => {
  const { id, title, favorite, age_minimum, description, poster } = req.body;
  const favoriteBoolean = favorite === "true";
  const poster_file = req.file;

  try {
    const result = await mariadbService.executeTransaction(
      async (conn: any) => {
        const [rows] = await conn.query(
          `SELECT poster FROM film WHERE id = ?`,
          [id]
        );

        let poster_final = poster;
        const oldPosterFilename = rows && rows[0]?.poster;

        if (poster_file) {
          if (process.env.NODE_ENV === "production") {
            const cloudinaryResult = await uploadToCloudinary(poster_file);
            poster_final = cloudinaryResult.secure_url.split("/").pop();
          }

          if (oldPosterFilename) {
            if (process.env.NODE_ENV === "production") {
              await deleteFromCloudinary(oldPosterFilename);
            } else {
              deletePoster(oldPosterFilename);
            }
          }
        }

        await conn.query(
          `UPDATE film SET title = ?, favorite = ?, age_minimum = ?, description = ?, poster = ? WHERE id = ?`,
          [title, favoriteBoolean, age_minimum, description, poster_final, id]
        );

        return await fetchFilms();
      }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du film",
      error: getErrorMessage(error),
    });
  }
};

const addFilm = async (req: Request, res: Response) => {
  const { id, title, description, age_minimum, favorite, poster } = req.body;
  const release_date = getNextWednesday();
  const favoriteBool = favorite === "true" || favorite === true;
  const poster_file = req.file;
  let poster_final = poster_file ? poster_file.filename : poster;

  if (id !== "" && id !== undefined)
    res.status(500).json({ message: "id defined" });

  if (poster_file) poster_final = poster_file.filename;

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(
        `INSERT INTO film (title, description, release_date, age_minimum, favorite, poster) VALUES (?,?,?,?,?,?)`,
        [
          title,
          description,
          release_date,
          age_minimum,
          favoriteBool,
          poster_final,
        ]
      );
      return await fetchFilms();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout du film'",
      error: getErrorMessage(error),
    });
  }
};

const deleteFilm = async (req: Request, res: Response) => {
  const filmId = req.params.id;

  try {
    const result = await mariadbService.executeTransaction(async () => {
      const [rows] = await mariadbService.query(
        `SELECT poster FROM film WHERE id = ?`,
        [filmId]
      );

      if (rows && rows.poster) {
        if (process.env.NODE_ENV === "production") {
          const posterFilename = path.basename(rows.poster);
          await deleteFromCloudinary(posterFilename);
        } else {
          const posterFilename = path.basename(rows.poster);
          deletePoster(posterFilename);
        }
      }

      await mariadbService.query(`DELETE FROM film WHERE id = ?`, [filmId]);
      return await fetchFilms();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du film",
      error: getErrorMessage(error),
    });
  }
};

function getNextWednesday() {
  const today = new Date();
  let nextWednesday = new Date();

  const currentDay = today.getDay();

  let daysUntilWednesday = 3 - currentDay;
  if (daysUntilWednesday <= 0) {
    daysUntilWednesday += 7;
  }

  nextWednesday.setDate(today.getDate() + daysUntilWednesday);

  const release_date = nextWednesday
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  return release_date;
}

const deletePoster = (posterFilename: string) => {
  if (!posterFilename) {
    console.error("Nom de fichier non fourni.");
    return;
  }

  const absolutePath = path.resolve(
    __dirname,
    "../../../public/images",
    posterFilename
  );

  fs.unlink(absolutePath, (error) => {
    if (error) {
      console.error("Erreur lors de la suppression du fichier:", error);
    }
  });
};

const scoreFilmById = async (req: Request, res: Response) => {
  const filmId = req.params.id;
  const { rating, userId, description } = req.body;
  const added_date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const status = "waiting approval";

  try {
    const result = await mariadbService.executeTransaction(async () => {
      const checkResult = await mariadbService.query(
        `SELECT * FROM opinion WHERE film_id = ? AND user_id = ?`,
        [filmId, userId]
      );

      if (checkResult.length > 0) {
        const updateResult = await mariadbService.query(
          `UPDATE opinion SET rating = ?, description = ?, added_date = ?, status = ? WHERE film_id = ? AND user_id = ?`,
          [rating, description, added_date, status, filmId, userId]
        );

        if (updateResult.affectedRows <= 0) {
          res.sendStatus(404);
        }
      } else {
        const insertResult = await mariadbService.query(
          `INSERT INTO opinion (film_id, user_id, rating, description, added_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
          [filmId, userId, rating, description, added_date, status]
        );

        if (insertResult.affectedRows <= 0) {
          res.sendStatus(404);
        }
      }
    });

    res.json({
      message: "Film noté avec succès",
      rating,
      description,
      added_date,
      status,
    });
  } catch (error) {
    console.error("Erreur lors de la notation de la réservation:", error);
    res.sendStatus(500);
  }
};

export {
  addFilm,
  deleteFilm,
  fetchFilmById,
  getFilmById,
  getFilms,
  getFilmsByCinemaId,
  getFilmsByDate,
  getFilmsByGenreId,
  scoreFilmById,
  updateFilm,
};
