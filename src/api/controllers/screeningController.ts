import { Request, Response } from "express";
import moment from "moment-timezone";
import mariadbService from "../../services/mariadb.service.js";
import { getErrorMessage } from "../../utils/error.js";
import { fetchAuditoriumById } from "./auditoriumController.js";
import { fetchFilmById } from "./filmController.js";
import { fetchQualityById } from "./qualityController.js";

const getScreeningById = async (req: Request, res: Response) => {
  try {
    const screeningId = parseInt(req.params.id, 10);
    const screening = await fetchScreeningById(screeningId);

    if (!screening) {
      return res.status(404).json({ message: "Aucun screening trouvé" });
    }

    res.status(200).json(screening);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du screening",
      error: getErrorMessage(error),
    });
  }
};

const fetchScreeningById = async (screeningId: number) => {
  try {
    const rows = await mariadbService.query(
      `SELECT
        sc.id,
        sc.film_id,
        sc.auditorium_id,
        sc.start_time,
        sc.end_time
      FROM screening sc
      WHERE sc.id = ?`,
      [screeningId]
    );

    if (rows.length === 0) {
      return null;
    }

    const screening = {
      id: rows[0].id,
      film: await fetchFilmById(rows[0].film_id),
      auditorium: await fetchAuditoriumById(rows[0].auditorium_id),
      start_time: rows[0].start_time,
      end_time: rows[0].end_time,
    };

    return screening;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération du screening : ${getErrorMessage(error)}`
    );
  }
};

const getSeatsByScreeningId = async (req: Request, res: Response) => {
  const screeningId = req.params.id;

  try {
    const rows = await mariadbService.query(
      `SELECT DISTINCT 
        sc.id AS screening_id, 
        sc.start_time, 
        sc.end_time, 
        se.id AS seat_id, 
        se.number AS seat_number, 
        se.is_handi, 
        a.name AS auditorium_name, 
        a.cinema_id AS auditorium_cinema_id, 
        a.seat_handi AS auditorium_seat_handi,
        a.seat AS auditorium_seat,
        q.id AS quality_id,
        q.name AS quality_name,
        q.price AS quality_price,
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
      return res.status(404).json({ message: "Film ou séances non trouvé(es)" });
    }

    const screening = {
      id: rows[0].screening_id,
      start_time: rows[0].start_time,
      end_time: rows[0].end_time,
      auditorium: {
        name: rows[0].auditorium_name,
        seat: rows[0].auditorium_seat,
        seat_handi: rows[0].auditorium_seat_handi,
        quality: await fetchQualityById(rows[0].quality_id),
        cinema_id: rows[0].auditorium_cinema_id,
      },
    };

    const seats = rows.map((row: any) => ({
      id: row.seat_id,
      number: row.seat_number,
      is_handi: row.is_handi,
      is_available: row.is_available,
    }));

    res.status(200).json({
      screening,
      seats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des films",
      error: getErrorMessage(error),
    });
  }
};

const getScreeningsByFilmId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const filmId = req.params.filmId;

  try {
    const screeningsByFilm = await mariadbService.query(
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
        s.id AS screening_id, 
        s.film_id AS screening_film_id, 
        s.auditorium_id AS screening_auditorium_id, 
        s.remaining_seat, 
        s.remaining_seat_handi, 
        s.start_time, 
        s.end_time, 
        a.name AS auditorium_name, 
        a.seat AS auditorium_seat, 
        a.seat_handi AS auditorium_seat_handi, 
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
        AND (s.remaining_seat > 0 OR s.remaining_seat_handi > 0)
      ORDER BY
        s.start_time ASC`,
      [filmId]
    );

    if (screeningsByFilm.length === 0) {
      res.status(404).json({ message: "Film ou séances non trouvé(es)" });
    }

    const genres = await mariadbService.query(
      `SELECT GROUP_CONCAT(g.name SEPARATOR ', ') AS genres 
      FROM film f 
      LEFT JOIN film_genre fg ON f.id = fg.film_id 
      LEFT JOIN genre g ON fg.genre_id = g.id 
      WHERE f.id = ?`,
      [filmId]
    );

    if (genres.length === 0) {
      res.status(404).json({ message: "Genres du film non trouvés" });
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

    const screeningsByDay: Record<string, any[]> = {};

    screeningsByFilm.forEach((row: any) => {
      const date = new Date(row.start_time);
      const dateKey = date.toISOString().split("T")[0];

      if (!screeningsByDay[dateKey]) {
        screeningsByDay[dateKey] = [];
      }

      screeningsByDay[dateKey].push({
        id: row.screening_id,
        film,
        start_time: row.start_time,
        end_time: row.end_time,
        auditorium: {
          name: row.auditorium_name,
          seat: row.auditorium_seat,
          seat_handi: row.auditorium_seat_handi,
          quality: {
            id: row.auditorium_quality_id,
            name: row.auditorium_quality,
            price: row.auditorium_price,
          },
          price: row.auditorium_price,
          cinema: {
            id: row.cinema_id,
            name: row.cinema_name,
            address: row.cinema_address,
            city: row.cinema_city,
            postcode: row.cinema_postcode,
            phone: row.cinema_phone,
          },
        },
      });
    });

    const screeningsByDayArray = Object.keys(screeningsByDay).map((date) => ({
      day: date,
      screeningsByDay: screeningsByDay[date],
    }));

    res.status(200).json({
      film,
      screenings: screeningsByDayArray,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des screenings",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const getFilmScreeningsByCinemaId = async (req: Request, res: Response) => {
  const filmId = req.params.filmId;
  const cinemaId = req.params.cinemaId;

  try {
    const filmScreeningsByCinema = await mariadbService.query(
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
        s.id AS screening_id, 
        s.film_id AS screening_film_id, 
        s.auditorium_id AS screening_auditorium_id, 
        s.remaining_seat, 
        s.remaining_seat_handi, 
        s.start_time, 
        s.end_time, 
        a.name AS auditorium_name, 
        a.seat AS auditorium_seat, 
        a.seat_handi AS auditorium_seat_handi, 
        a.cinema_id AS auditorium_cinema_id, 
        q.name AS auditorium_quality, 
        q.price AS auditorium_price
      FROM 
        screening s 
        INNER JOIN film f ON s.film_id = f.id 
        INNER JOIN auditorium a ON s.auditorium_id = a.id 
        INNER JOIN cinema c ON a.cinema_id = c.id 
        INNER JOIN quality q ON q.id = a.quality_id 
      WHERE 
        f.id = ? 
        AND c.id = ?
        AND (s.remaining_seat > 0 OR s.remaining_seat_handi > 0)
      ORDER BY
        s.start_time ASC`,
      [filmId, cinemaId]
    );

    if (filmScreeningsByCinema.length === 0) {
      return res
        .status(404)
        .json({ message: "Film ou séances non trouvé(es)" });
    }

    const genres = await mariadbService.query(
      `SELECT GROUP_CONCAT(g.name SEPARATOR ', ') AS genres 
      FROM film f 
      LEFT JOIN film_genre fg ON f.id = fg.film_id 
      LEFT JOIN genre g ON fg.genre_id = g.id 
      WHERE f.id = ?`,
      [filmId]
    );

    if (genres.length === 0) {
      return res.status(404).json({ message: "Genres du film non trouvés" });
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

    const screeningsByDay: Record<string, any[]> = {};

    filmScreeningsByCinema.forEach((row: any) => {
      const date = new Date(row.start_time);
      const dateKey = date.toISOString().split("T")[0];

      if (!screeningsByDay[dateKey]) {
        screeningsByDay[dateKey] = [];
      }

      screeningsByDay[dateKey].push({
        id: row.screening_id,
        film,
        start_time: row.start_time,
        end_time: row.end_time,
        auditorium: {
          name: row.auditorium_name,
          seat: row.auditorium_seat,
          seat_handi: row.auditorium_seat_handi,
          quality: {
            name: row.auditorium_quality,
            price: row.auditorium_price,
          },
          cinema: {
            id: row.cinema_id,
            name: row.cinema_name,
            address: row.cinema_address,
            city: row.cinema_city,
            postcode: row.cinema_postcode,
            phone: row.cinema_phone,
          },
        },
      });
    });

    const screeningsByDayArray = Object.keys(screeningsByDay).map((date) => ({
      day: date,
      screeningsByDay: screeningsByDay[date],
    }));

    res.json({
      film,
      screenings: screeningsByDayArray,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des screenings",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

const fetchScreenings = async () => {
  return await mariadbService.executeTransaction(async () => {
    const rows = await mariadbService.query(
      `SELECT 
        f.id AS film_id, 
        f.title, 
        f.description, 
        f.release_date, 
        f.age_minimum, 
        f.favorite, 
        f.poster,
        s.id AS screening_id, 
        s.film_id AS screening_film_id, 
        s.auditorium_id AS screening_auditorium_id, 
        s.remaining_seat, 
        s.remaining_seat_handi, 
        s.start_time, 
        s.end_time, 
        a.id AS auditorium_id, 
        a.name AS auditorium_name, 
        a.seat AS auditorium_seat, 
        a.seat_handi AS auditorium_seat_handi, 
        a.cinema_id AS auditorium_cinema_id,
        c.id AS cinema_id, 
        c.name AS cinema_name, 
        c.address AS cinema_address, 
        c.city AS cinema_city, 
        c.postcode AS cinema_postcode, 
        c.phone AS cinema_phone, 
        q.name AS auditorium_quality, 
        q.price AS auditorium_price 
      FROM 
        screening s 
        INNER JOIN film f ON s.film_id = f.id 
        INNER JOIN auditorium a ON s.auditorium_id = a.id
        INNER JOIN cinema c ON a.cinema_id = c.id 
        INNER JOIN quality q ON q.id = a.quality_id`
    );

    if (rows.length === 0) {
      return { screenings: [] };
    }

    const screenings = rows.map((row: any) => ({
      id: row.screening_id,
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time),
      remaining_seat: row.remaining_seat,
      remaining_seat_handi: row.remaining_seat_handi,
      film: {
        id: row.film_id,
        title: row.title,
        description: row.description,
        release_date: row.release_date,
        age_minimum: row.age_minimum,
        favorite: row.favorite,
        poster: row.poster,
      },
      auditorium: {
        id: row.auditorium_id,
        name: row.auditorium_name,
        seat: row.auditorium_seat,
        seat_handi: row.auditorium_seat_handi,
        quality: row.auditorium_quality,
        price: row.auditorium_price,
        cinema: {
          id: row.cinema_id,
          name: row.cinema_name,
          address: row.cinema_address,
          city: row.cinema_city,
          postcode: row.cinema_postcode,
          phone: row.cinema_phone,
        },
      },
    }));

    const films = await mariadbService.query(`SELECT * FROM film`);
    const auditoriums = await mariadbService.query(`SELECT * FROM auditorium`);

    return { screenings, films, auditoriums };
  });
};

const getScreenings = async (req: Request, res: Response) => {
  try {
    const result = await fetchScreenings();

    if (result.screenings.length === 0) {
      res.status(404).json({ message: "Film ou séances non trouvé(es)" });
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des screenings",
      error: getErrorMessage(error),
    });
  }
};

const updateScreening = async (req: Request, res: Response) => {
  const {
    locale,
    screening: { id, start_time, end_time, film, auditorium },
  } = req.body;

  const formatted_start_time = moment(start_time)
    .tz(locale)
    .format("YYYY-MM-DD HH:mm:ss");

  const formatted_end_time = moment(end_time)
    .tz(locale)
    .format("YYYY-MM-DD HH:mm:ss");

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(
        `UPDATE screening
        SET
          start_time = ?,
          end_time = ?,
          film_id = ?,
          auditorium_id = ?
        WHERE id = ?`,
        [formatted_start_time, formatted_end_time, film.id, auditorium.id, id]
      );

      return await fetchScreenings();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout' de la séance",
      error: getErrorMessage(error),
    });
  }
};

const addScreening = async (req: Request, res: Response) => {
  const { id, start_time, end_time, film, auditorium } = req.body;
  const formatted_start_time = new Date(start_time)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const formatted_end_time = new Date(end_time)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  if (id !== undefined) res.status(500).json({ message: "id defined" });

  try {
    const result = await mariadbService.executeTransaction(async () => {
      const row = await mariadbService.query(
        `SELECT seat, seat_handi, cinema_id from auditorium WHERE id = ?`,
        [auditorium.id]
      );

      const remaining_seat = row[0].seat;
      const remaining_seat_handi = row[0].seat_handi;
      const cinema_id = row[0].cinema_id;

      const isCinemaFilm = await mariadbService.query(
        `SELECT * FROM cinema_film WHERE cinema_id = ? AND film_id = ?`,
        [cinema_id, film.id]
      );

      if (isCinemaFilm.length === 0) {
        await mariadbService.query(
          `INSERT INTO cinema_film (cinema_id, film_id) VALUES (?, ?)`,
          [cinema_id, film.id]
        );
      }

      await mariadbService.query(
        `INSERT INTO screening (start_time, end_time, remaining_seat, remaining_seat_handi, film_id, auditorium_id) VALUES (?,?,?,?,?,?)`,
        [
          formatted_start_time,
          formatted_end_time,
          remaining_seat,
          remaining_seat_handi,
          film.id,
          auditorium.id,
        ]
      );
      return await fetchScreenings();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout' de la séance",
      error: getErrorMessage(error),
    });
  }
};

const deleteScreeningById = async (req: Request, res: Response) => {
  const screeningId = req.params.id;

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(`DELETE FROM screening WHERE id = ?`, [
        screeningId,
      ]);
      return await fetchScreenings();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la séance",
      error: getErrorMessage(error),
    });
  }
};

export {
  addScreening,
  deleteScreeningById,
  fetchScreeningById,
  getFilmScreeningsByCinemaId,
  getScreeningById,
  getScreenings,
  getScreeningsByFilmId,
  getSeatsByScreeningId,
  updateScreening,
};
