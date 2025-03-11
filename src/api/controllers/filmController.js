const path = require("path");
const fs = require("fs");
const dbService = require("../../services/database.service");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../services/cloudinary.service");

const getFilms = async (req, res) => {
  try {
    const films = await fetchFilms();

    if (films.length === 0) {
      return res.status(404).json({ message: "Film(s) non trouvé(s)" });
    }

    res.json(films);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
  }
};

const fetchFilms = async () => {
  try {
    const rows = await dbService.query(
      `SELECT 
        f.id,
        f.title,
        f.description,
        GROUP_CONCAT(g.name SEPARATOR ', ') AS genres,
        f.release_date,
        f.age_minimum,
        f.favorite,
        f.poster
      FROM 
        film f
      LEFT JOIN 
        film_genre fg ON f.id = fg.film_id
      LEFT JOIN 
        genre g ON fg.genre_id = g.id
      GROUP BY 
        f.id`
    );

    const films = rows.map((film) => ({
      ...film,
      release_date: new Date(film.release_date),
      process: process.env,
    }));

    return films;
  } catch (error) {
    return [];
  }
};

const getFilmsByCinemaId = async (req, res) => {
  const cinemaId = req.params.id;
  try {
    const rows = await dbService.query(
      `SELECT 
        f.id,
        f.title,
        f.description,        
        GROUP_CONCAT(g.name SEPARATOR ', ') AS genres,
        f.release_date,
        f.age_minimum,
        f.favorite,
        f.poster
      FROM 
        film f
      LEFT JOIN 
        cinema_film cf ON f.id = cf.film_id
      LEFT JOIN 
        cinema c ON cf.cinema_id = c.id
      LEFT JOIN 
        film_genre fg ON f.id = fg.film_id
      LEFT JOIN 
        genre g ON fg.genre_id = g.id
      WHERE c.id = ?
      GROUP BY 
        f.id`,
      [cinemaId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
  }
};

const getFilmsByGenreId = async (req, res) => {
  const genreId = req.params.id;
  try {
    const rows = await dbService.query(
      `SELECT 
        f.id,
        f.title,
        f.description,
        GROUP_CONCAT(g.name SEPARATOR ', ') AS genres,
        f.release_date,
        f.age_minimum,
        f.favorite,
        f.poster
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
      error: error.message,
    });
  }
};

const getFilmsByDate = async (req, res) => {
  const date = req.params.date;
  const start = date + " 00:00:00";
  const end = date + " 23:59:59";

  try {
    const rows = await dbService.query(
      `SELECT f.id, f.title, f.description, f.release_date, f.age_minimum, f.favorite, f.poster
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
      error: error.message,
    });
  }
};

const updateFilm = async (req, res) => {
  const { id, title, favorite, age_minimum, description, poster } = req.body;
  const favoriteBoolean = favorite === "true";
  const poster_file = req.file;

  try {
    const [rows] = await dbService.query(
      `SELECT poster FROM film WHERE id = ?`,
      [id]
    );

    let poster_final = poster;
    let oldPosterFilename = rows ? rows.poster : null;

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

    const result = await dbService.executeTransaction(async () => {
      await dbService.query(
        `UPDATE film SET title = ?, favorite = ?, age_minimum = ?, description = ?, poster = ? WHERE id = ?`,
        [title, favoriteBoolean, age_minimum, description, poster_final, id]
      );
      return await fetchFilms();
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du film",
      error: error.message,
    });
  }
};

const addFilm = async (req, res) => {
  const { id, title, description, age_minimum, favorite, poster } = req.body;
  const release_date = getNextWednesday();
  const favoriteBool = favorite === "true" || favorite === true;
  const poster_file = req.file;
  const poster_final = poster_file ? poster_file.filename : poster;

  if (id !== "") return res.status(500).json({ message: "id defined" });

  if (poster_file) poster_final = poster_file.filename;

  try {
    const result = await dbService.executeTransaction(async () => {
      await dbService.query(
        `INSERT INTO film (title, description, release_date, age_minimum, favorite, poster) VALUES (?,?,?,?,?, ?)`,
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
      message: "Erreur lors de l'ajout du film",
      error: error.message,
    });
  }
};

const deleteFilm = async (req, res) => {
  const filmId = req.params.id;

  try {
    const result = await dbService.executeTransaction(async () => {
      const [rows] = await dbService.query(
        `SELECT poster FROM film WHERE id = ?`,
        [filmId]
      );

      if (rows && rows.poster) {
        if (process.env.NODE_ENV === "production") {
          const posterFilename = path.basename(rows.poster);
          await cloudinaryService.deleteFromCloudinary(posterFilename);
        } else {
          const posterFilename = path.basename(rows.poster);
          deletePoster(posterFilename);
        }
      }

      await dbService.query(`DELETE FROM film WHERE id = ?`, [filmId]);
      return await fetchFilms();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du film",
      error: error.message,
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

const deletePoster = (posterFilename) => {
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

module.exports = {
  getFilms,
  getFilmsByCinemaId,
  getFilmsByGenreId,
  getFilmsByDate,
  updateFilm,
  addFilm,
  deleteFilm,
};
