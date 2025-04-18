import { Request, Response } from "express";
import mariadbService from "../../services/mariadb.service";
import { getErrorMessage } from "../../utils/error";

const getMaterials = async (req: Request, res: Response) => {
  try {
    const rows = await mariadbService.query(`SELECT * FROM material`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des matériels",
      error: getErrorMessage(error),
    });
  }
};

const fetchMaterials = async () => {
  try {
    const rows = await mariadbService.query(`SELECT * FROM material`);
    return rows;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des matériels");
  }
};

export { fetchMaterials, getMaterials };
