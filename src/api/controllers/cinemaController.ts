import { Request, Response } from "express";
import mariadbService from "../../services/mariadb.service.js";
import { getErrorMessage } from "../../utils/error.js";

const getCinemaById = async (req: Request, res: Response) => {
  const cinemaId = parseInt(req.params.id, 10);

  try {
    const cinema = await fetchCinemaById(cinemaId);

    if (!cinema) {
      res.status(404).json({ message: "Cinéma non trouvé" });
      return;
    }

    res.status(200).json(cinema);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du cinéma",
      error: getErrorMessage(error),
    });
  }
};

const fetchCinemaById = async (cinemaId: number) => {
  try {
    const rows = await mariadbService.query(
      "SELECT * FROM cinema WHERE cinema.id = ?",
      [cinemaId]
    );

    if (rows.length === 0) {
      return null;
    }

    const openings = await fetchOpeningsByCinemaId(cinemaId);

    const cinema = {
      id: rows[0].id,
      name: rows[0].name,
      address: rows[0].address,
      city: rows[0].city,
      postcode: rows[0].postcode,
      phone: rows[0].phone,
      opening_hours: openings.map((opening: any) => ({
        day_of_week: opening.day_of_week,
        opening_time: opening.opening_time,
        closing_time: opening.closing_time,
      })),
    };

    return cinema;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de l'utilisateur: ${getErrorMessage(
        error
      )}`
    );
  }
};

const getCinemas = async (req: Request, res: Response) => {
  try {
    const rows = await fetchCinemas();

    if (rows.length === 0) {
      res.json({ message: "Aucun cinéma trouvé" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des cinemas",
      error: getErrorMessage(error),
    });
  }
};

const fetchCinemas = async () => {
  try {
    const rows = await mariadbService.query(`SELECT * FROM cinema`);

    if (rows.length === 0) {
      return [];
    }

    return rows;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des cinemas: ${getErrorMessage(error)}`
    );
  }
};

const getCinemaByScreeningId = async (req: Request, res: Response) => {
  const screeningId = parseInt(req.params.id, 10);
  try {
    const cinema = await fetchCinemaByScreeningId(screeningId);

    if (!cinema) {
      res.status(404).json({ message: "Cinéma du screening non trouvé" });
      return;
    }

    res.json(cinema);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du cinéma",
      error: getErrorMessage(error),
    });
  }
};

const fetchCinemaByScreeningId = async (screeningId: number) => {
  try {
    const rows = await mariadbService.query(
      `SELECT
        c.id AS cinema_id,
        c.name AS cinema_name,
        c.address AS cinema_address,
        c.city AS cinema_city,
        c.postcode AS cinema_postcode,
        c.phone AS cinema_phone
      FROM
        screening s
        INNER JOIN auditorium a ON a.id = s.auditorium_id
        INNER JOIN cinema c ON c.id = a.cinema_id
      WHERE
        s.id = ?`,
      [screeningId]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      id: rows[0].cinema_id,
      name: rows[0].cinema_name,
      address: rows[0].cinema_address,
      city: rows[0].cinema_city,
      postcode: rows[0].cinema_postcode,
      phone: rows[0].cinema_phone,
    };
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération du cinéma: ${getErrorMessage(error)}`
    );
  }
};

const fetchOpeningsByCinemaId = async (cinema_id: number) => {
  if (!cinema_id) {
    throw new Error("Veuillez renseigner un id de cinéma");
  }

  try {
    const openings = await mariadbService.query(
      `SELECT 
        c.name AS cinema_name,
        oh.day_of_week,
        oh.opening_time,
        oh.closing_time
      FROM 
        cinema c
      INNER JOIN 
        cinema_opening_hours oh ON c.id = oh.cinema_id
      WHERE cinema_id = ?`,
      [cinema_id]
    );

    return openings;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des horaires d'ouverture");
  }
};

export {
  fetchCinemaById,
  fetchCinemaByScreeningId,
  fetchCinemas,
  getCinemaById,
  getCinemaByScreeningId,
  getCinemas,
};
