const dbService = require("../../services/database.service");

const getScreeningById = async (req, res) => {
  try {
    const screeningId = req.params.id;

    const [rows] = await dbService.query(
      `SELECT 
        sc.id,
        sc.start_time,
        sc.end_time,
        a.name AS auditorium_name,
        a.seat AS auditorium_seat,
        a.handi_seat AS auditorium_handi_seat,
        a.cinema_id AS auditorium_cinema_id,
        q.name AS auditorium_quality,
        q.price AS auditorium_price      
      FROM screening sc 
      INNER JOIN auditorium a ON a.id = sc.auditorium_id 
      INNER JOIN quality q ON q.id = a.quality_id 
      WHERE sc.id = ?`,
      [screeningId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Aucun screening trouvé" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du screening",
      error: error.message,
    });
  }
};

const getSeatsByScreeningId = async (req, res) => {
  const screeningId = req.params.id;

  try {
    const rows = await dbService.query(
      `SELECT DISTINCT 
        sc.id AS screening_id, 
        sc.start_time, 
        sc.end_time, 
        se.id AS seat_id, 
        se.number AS seat_number, 
        se.is_handi, 
        a.name AS auditorium_name, 
        a.cinema_id AS auditorium_cinema_id, 
        a.handi_seat AS auditorium_handi_seat,
        a.seat AS auditorium_seat,
        q.name AS auditorium_quality,
        q.price AS auditorium_price,
        CASE 
          WHEN bsc.seat_id IS NULL THEN TRUE 
          ELSE FALSE 
        END AS is_available 
      FROM 
        screening sc 
        INNER JOIN auditorium a ON a.id = sc.auditorium_id 
        INNER JOIN seat se ON se.auditorium_id = a.id 
        LEFT JOIN booking_screening_seat bsc ON bsc.seat_id = se.id AND bsc.screening_id = sc.id
        INNER JOIN quality q ON q.id = a.quality_id
      WHERE 
        sc.id = ?`,
      [screeningId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Film ou séances non trouvé(es)" });
    }

    const screening = {
      id: rows[0].screening_id,
      start_time: rows[0].start_time,
      end_time: rows[0].end_time,
      auditorium: {
        name: rows[0].auditorium_name,
        seat: rows[0].auditorium_seat,
        handi_seat: rows[0].auditorium_handi_seat,
        quality: rows[0].auditorium_quality,
        price: rows[0].auditorium_price,
        cinema_id: rows[0].cinema_id,
      },
    };

    const seats = rows.map((row) => ({
      id: row.seat_id,
      number: row.seat_number,
      is_handi: row.is_handi,
      is_available: row.is_available,
    }));

    res.json({
      screening,
      seats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: error.message,
    });
  }
};

const getScreeningsByFilmId = async (req, res) => {
  const filmId = req.params.filmId;

  try {
    const screeningsByFilm = await dbService.query(
      `SELECT 
        f.id AS film_id, 
        f.title, 
        f.description, 
        f.release_date, 
        f.age_minimum, 
        f.favorite, 
        f.poster, 
        c.id AS cinema_id, 
        c.name AS cinema_name, 
        c.address AS cinema_address, 
        c.city AS cinema_city, 
        c.postcode AS cinema_postcode, 
        c.phone AS cinema_phone, 
        c.opening_hours AS cinema_opening_hours, 
        s.id AS screening_id, 
        s.film_id AS screening_film_id, 
        s.auditorium_id AS screening_auditorium_id, 
        s.remaining_seat, 
        s.remaining_handi_seat, 
        s.start_time, 
        s.end_time, 
        a.name AS auditorium_name, 
        a.seat AS auditorium_seat, 
        a.handi_seat AS auditorium_handi_seat, 
        a.cinema_id AS auditorium_cinema_id, 
        q.name AS auditorium_quality_id, 
        q.name AS auditorium_quality, 
        q.price AS auditorium_price 
      FROM 
        screening s 
        JOIN film f ON s.film_id = f.id 
        JOIN auditorium a ON s.auditorium_id = a.id 
        JOIN cinema c ON a.cinema_id = c.id 
        INNER JOIN quality q ON q.id = a.quality_id 
      WHERE 
        f.id = ? 
      ORDER BY
        s.start_time ASC`,
      //AND s.start_time > NOW()`,
      [filmId]
    );

    if (getScreeningsByFilmId.length === 0) {
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
      id: screeningsByFilm[0].film_id,
      title: screeningsByFilm[0].title,
      genres: genres[0].genres,
      description: screeningsByFilm[0].description,
      release_date: screeningsByFilm[0].release_date,
      age_minimum: screeningsByFilm[0].age_minimum,
      favorite: screeningsByFilm[0].favorite,
      poster: screeningsByFilm[0].poster,
    };

    const screenings = screeningsByFilm.map((row) => ({
      id: row.screening_id,
      film_id: row.screening_film_id,
      start_time: row.start_time,
      end_time: row.end_time,
      auditorium: {
        name: row.auditorium_name,
        seat: row.auditorium_seat,
        handi_seat: row.auditorium_handi_seat,
        quality: row.auditorium_quality,
        quality_id: row.auditorium_quality_id,
        price: row.auditorium_price,
        cinema: {
          id: row.cinema_id,
          name: row.cinema_name,
          address: row.cinema_address,
          city: row.cinema_city,
          postcode: row.cinema_postcode,
          phone: row.cinema_phone,
          opening_hours: row.cinema_opening_hours,
        },
      },
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

const getFilmScreeningsByCinemaId = async (req, res) => {
  const filmId = req.params.filmId;
  const cinemaId = req.params.cinemaId;

  try {
    const filmScreeningsByCinema = await dbService.query(
      `SELECT 
        f.id AS film_id, 
        f.title, 
        f.description, 
        f.release_date, 
        f.age_minimum, 
        f.favorite, 
        f.poster, 
        c.id AS cinema_id, 
        c.name AS cinema_name, 
        c.address AS cinema_address, 
        c.city AS cinema_city, 
        c.postcode AS cinema_postcode, 
        c.phone AS cinema_phone, 
        c.opening_hours AS cinema_opening_hours, 
        s.id AS screening_id, 
        s.film_id AS screening_film_id, 
        s.auditorium_id AS screening_auditorium_id, 
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
        screening s 
        JOIN film f ON s.film_id = f.id 
        JOIN auditorium a ON s.auditorium_id = a.id 
        JOIN cinema c ON a.cinema_id = c.id 
        INNER JOIN quality q ON q.id = a.quality_id 
      WHERE 
        f.id = ? 
        AND c.id = ?
      ORDER BY
        s.start_time ASC`,
      //AND s.start_time > NOW()`,
      [filmId, cinemaId]
    );

    if (filmScreeningsByCinema.length === 0) {
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
      id: filmScreeningsByCinema[0].film_id,
      title: filmScreeningsByCinema[0].title,
      genres: genres[0].genres,
      description: filmScreeningsByCinema[0].description,
      release_date: filmScreeningsByCinema[0].release_date,
      age_minimum: filmScreeningsByCinema[0].age_minimum,
      favorite: filmScreeningsByCinema[0].favorite,
      poster: filmScreeningsByCinema[0].poster,
    };

    const screenings = filmScreeningsByCinema.map((row) => ({
      id: row.screening_id,
      film_id: row.screening_film_id,
      start_time: row.start_time,
      end_time: row.end_time,
      auditorium: {
        name: row.auditorium_name,
        seat: row.auditorium_seat,
        handi_seat: row.auditorium_handi_seat,
        quality: row.auditorium_quality,
        price: row.auditorium_price,
        cinema: {
          id: filmScreeningsByCinema[0].cinema_id,
          name: filmScreeningsByCinema[0].cinema_name,
          address: filmScreeningsByCinema[0].cinema_address,
          city: filmScreeningsByCinema[0].cinema_city,
          postcode: filmScreeningsByCinema[0].cinema_postcode,
          phone: filmScreeningsByCinema[0].cinema_phone,
          opening_hours: filmScreeningsByCinema[0].cinema_opening_hours,
        },
      },
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
  getScreeningById,
  getSeatsByScreeningId,
  getScreeningsByFilmId,
  getFilmScreeningsByCinemaId,
};
