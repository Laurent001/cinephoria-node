const dbService = require("../../services/database.service");

const getFilms = async (req, res) => {
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
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
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

  console.log("start", start);
  console.log("end", end);

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

module.exports = {
  getFilms,
  getFilmsByCinemaId,
  getFilmsByGenreId,
  getFilmsByDate,
};
