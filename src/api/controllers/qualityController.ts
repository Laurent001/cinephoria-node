import { Request, Response } from "express";
import mariadbService from "../../services/mariadb.service.ts";
import { getErrorMessage } from "../../utils/error.ts";

const getQualityById = async (req: Request, res: Response) => {
  try {
    const qualityId = parseInt(req.params.id, 10);
    const quality = await fetchQualityById(qualityId);

    if (!quality) {
      return res.status(404).json({ message: "Aucune qualité trouvé" });
    }

    res.json(quality);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la qualityt",
      error: getErrorMessage(error),
    });
  }
};

const fetchQualityById = async (qualityId: number) => {
  try {
    const rows = await mariadbService.query(
      `SELECT * FROM quality q
      WHERE q.id = ?`,
      [qualityId]
    );

    if (rows.length === 0) {
      return null;
    }

    const quality = {
      id: rows[0].id,
      name: rows[0].name,
      price: rows[0].price,
    };

    return quality;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération de la qualité : ${getErrorMessage(error)}`
    );
  }
};

export { fetchQualityById, getQualityById };
