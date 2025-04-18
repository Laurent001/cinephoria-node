import { Request, Response } from "express";
import mariadbService from "../../services/mariadb.service";
import { getErrorMessage } from "../../utils/error";

const getGenres = async (req: Request, res: Response) => {
  try {
    const rows = await mariadbService.query(`SELECT * FROM genre`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des genres",
      error: getErrorMessage(error),
    });
  }
};

export { getGenres };
