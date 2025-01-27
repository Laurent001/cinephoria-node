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
  try {
    const rows = await dbService.query(
      `SELECT DISTINCT f.id, f.title, f.description, f.release_date, f.age_minimum, f.favorite, f.poster, s.id AS screening_id, s.auditorium_id, s.remaining_seat, s.remaining_handi_seat, s.start_time, s.end_time
      FROM 
        film f
      INNER JOIN 
        screening s ON f.id = s.film_id
      WHERE 
        DATE(s.start_time) = ?`,
      [date]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des screenings",
      error: error.message,
    });
  }
};

const getScreeningsByFilmId = async (req, res) => {
  const filmId = req.params.id;
  try {
    const screeningsByFilmRows = await dbService.query(
      `SELECT 
        f.id AS film_id, 
        f.title, 
        f.description, 
        f.release_date, 
        f.age_minimum, 
        f.favorite, 
        f.poster, 
        s.id AS screening_id, 
        s.auditorium_id, 
        s.remaining_seat, 
        s.remaining_handi_seat, 
        s.start_time, 
        s.end_time, 
        a.name AS auditorium_name, 
        a.seat AS auditorium_seat, 
        a.handi_seat AS auditorium_handi_seat,
        a.cinema_id AS auditorium_cinema_id,
        q.name AS auditorium_quality,
        q.price AS auditorium_price
      FROM 
        film f 
        INNER JOIN screening s ON f.id = s.film_id 
        INNER JOIN auditorium a ON s.auditorium_id = a.id
        INNER JOIN quality q ON q.id = a.quality_id
      WHERE 
        f.id =  ?`,
      [filmId]
    );

    if (screeningsByFilmRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Film ou séances non trouvé(es)" });
    }

    var genres = await dbService.query(
      `SELECT GROUP_CONCAT(g.name SEPARATOR ', ') AS genres 
      FROM film f 
      LEFT JOIN film_genre fg ON f.id = fg.film_id 
      LEFT JOIN genre g ON fg.genre_id = g.id 
      WHERE f.id = ?`,
      [filmId]
    );

    if (genres.length === 0) {
      return res.status(404).json({ message: "genres du film non trouvé" });
    }

    const film = {
      id: screeningsByFilmRows[0].film_id,
      title: screeningsByFilmRows[0].title,
      genres: genres[0].genres,
      description: screeningsByFilmRows[0].description,
      release_date: screeningsByFilmRows[0].release_date,
      age_minimum: screeningsByFilmRows[0].age_minimum,
      favorite: screeningsByFilmRows[0].favorite,
      poster: screeningsByFilmRows[0].poster,
    };

    const screenings = screeningsByFilmRows.map((row) => ({
      id: row.screening_id,
      start_time: row.start_time,
      end_time: row.end_time,
      auditorium_name: row.auditorium_name,
      auditorium_seat: row.auditorium_seat,
      auditorium_handi_seat: row.auditorium_handi_seat,
      auditorium_cinema_id: row.auditorium_cinema_id,
      auditorium_quality: row.auditorium_quality,
      auditorium_price: row.auditorium_price,
    }));

    res.json({
      film,
      screenings,
    });
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
  getScreeningsByFilmId,
};
