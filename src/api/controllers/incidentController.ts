import { Request, Response } from "express";
import moment from "moment-timezone";
import * as incidentService from "../../services/incident.service";
import mariadbService from "../../services/mariadb.service";
import { getErrorMessage } from "../../utils/error";

const getIncidents = async (req: Request, res: Response) => {
  try {
    const result = await incidentService.fetchIncidents();
    if (!result || !Array.isArray(result.incidents)) {
      res.status(500).json({
        message: `Erreur lors de la récupération des incidents: données invalides`,
      });
      return;
    }

    if (
      result.incidents.length === 0 ||
      result.error === "Aucun incident trouvé"
    ) {
      res.status(404).json({
        message: "Aucun incident trouvé",
      });
      return;
    }

    if (result.error) {
      res.status(500).json({
        message: "Erreur lors de la récupération des incidents",
        error: result.error,
      });
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des incidents",
      error: getErrorMessage(error),
    });
  }
};

const updateIncident = async (req: Request, res: Response) => {
  const {
    locale,
    incident: { id, description, added_date, is_solved, material, auditorium },
  } = req.body;

  const formattedDate = moment(added_date)
    .tz(locale)
    .format("YYYY-MM-DD HH:mm:ss");

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(
        `UPDATE incident
        SET
          description = ?,
          added_date = ?,
          is_solved = ?,
          auditorium_id = ?,
          material_id = ?
        WHERE id = ?`,
        [description, formattedDate, is_solved, auditorium.id, material.id, id]
      );

      return await incidentService.fetchIncidents();
    });
    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la mise à jour" });
  }
};

const addIncident = async (req: Request, res: Response) => {
  const { description, is_solved, material, auditorium } = req.body;
  const added_date = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (req.body.id) {
    res.status(500).json({ message: "id defined" });
  }

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(
        `INSERT INTO incident (description, is_solved, added_date, material_id, auditorium_id) VALUES (?,?,?,?,?)`,
        [description, is_solved, added_date, material.id, auditorium.id]
      );
      return await incidentService.fetchIncidents();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout de l'incident",
      error: getErrorMessage(error),
    });
  }
};

const deleteIncidentById = async (req: Request, res: Response) => {
  const incidentId = req.params.id;

  try {
    const result = await mariadbService.executeTransaction(async () => {
      await mariadbService.query(`DELETE FROM incident WHERE id = ?`, [
        incidentId,
      ]);
      return await incidentService.fetchIncidents();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'incident",
      error: getErrorMessage(error),
    });
  }
};

export { addIncident, deleteIncidentById, getIncidents, updateIncident };
