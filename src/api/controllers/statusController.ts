import { Request, Response } from "express";
import mariadbService from "../../services/mariadb.service.ts";
import { getErrorMessage } from "../../utils/error.ts";

const fetchStatuses = async () => {
  try {
    const rows = await mariadbService.query(`SELECT * FROM status`);
    return rows;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération des status : ${getErrorMessage(error)}`
    );
  }
};

const fetchStatusById = async (statusId: number) => {
  try {
    const rows = await mariadbService.query(
      `SELECT * FROM status q
      WHERE q.id = ?`,
      [statusId]
    );

    if (rows.length === 0) {
      return null;
    }

    const status = {
      id: rows[0].id,
      name: rows[0].name,
    };

    return status;
  } catch (error) {
    throw new Error(
      `Erreur lors de la récupération du status : ${getErrorMessage(error)}`
    );
  }
};

const getStatuses = async (req: Request, res: Response) => {
  try {
    const rows = await fetchStatuses();
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des status",
      error: getErrorMessage(error),
    });
  }
};

const getStatusById = async (req: Request, res: Response) => {
  try {
    const statusId = parseInt(req.params.id, 10);
    const status = await fetchStatusById(statusId);

    if (!status) {
      return res.status(404).json({ message: "Aucun status trouvé" });
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du status",
      error: getErrorMessage(error),
    });
  }
};

export { fetchStatusById, fetchStatuses, getStatusById, getStatuses };
