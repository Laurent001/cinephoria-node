const dbService = require("../../services/database.service");
const auditoriumController = require("../controllers/auditoriumController");
const materialController = require("../controllers/materialController");
const moment = require("moment-timezone");

const fetchIncidents = async () => {
  try {
    const rows = await dbService.query(
      `SELECT 
        i.id AS incident_id, 
        i.description AS incident_description, 
        i.added_date AS incident_added_date, 
        i.is_solved AS incident_is_solved, 
        m.id AS material_id, 
        m.name AS material_name, 
        m.description AS material_description, 
        a.id AS auditorium_id, 
        a.name AS auditorium_name, 
        a.seat AS auditorium_seat, 
        a.handi_seat AS auditorium_handi_seat, 
        a.quality_id AS auditorium_quality_id, 
        c.id AS cinema_id, 
        c.name AS cinema_name, 
        c.address AS cinema_address, 
        c.city AS cinema_city, 
        c.postcode AS cinema_postcode, 
        c.phone AS cinema_phone, 
        c.opening_hours AS cinema_opening_hours 
      FROM 
        incident i 
        INNER JOIN auditorium a ON a.id = i.auditorium_id 
        INNER JOIN material m ON m.id = i.material_id 
        INNER JOIN cinema c ON c.id = a.cinema_id`
    );

    if (rows.length === 0) {
      return { incidents: [], error: "Aucun incident trouvé" };
    }

    const incidents = rows.map((row) => ({
      id: row.incident_id,
      description: row.incident_description,
      added_date: row.incident_added_date,
      is_solved: row.incident_is_solved,
      material: {
        id: row.material_id,
        name: row.material_name,
        description: row.material_description,
      },
      auditorium: {
        id: row.auditorium_id,
        name: row.auditorium_name,
        seat: row.auditorium_seat,
        handi_seat: row.auditorium_handi_seat,
        quality_id: row.auditorium_quality_id,
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

    const [auditoriums, materials] = await Promise.all([
      auditoriumController.fetchAuditoriums(),
      materialController.fetchMaterials(),
    ]);

    return { incidents, auditoriums, materials };
  } catch (error) {
    return {
      error: `Erreur lors de la récupération des incidents: ${error.message}`,
    };
  }
};

const getIncidents = async (req, res) => {
  try {
    const result = await fetchIncidents();

    if (result.error && !result.incidents) {
      return res.status(404).json({ message: result.error });
    }

    if (result.error) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des incidents",
        error: result.error,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des incidents",
      error: error.message,
    });
  }
};

const updateIncident = async (req, res) => {
  const {
    locale,
    incident: { id, description, added_date, is_solved, material, auditorium },
  } = req.body;

  const formattedDate = moment(added_date)
    .tz(locale)
    .format("YYYY-MM-DD HH:mm:ss");

  try {
    const result = await dbService.executeTransaction(async () => {
      await dbService.query(
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

      return await fetchIncidents();
    });
    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la mise à jour" });
  }
};

const addIncident = async (req, res) => {
  const { id, description, is_solved, material, auditorium } = req.body;
  added_date = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (id !== 0) return res.status(500).json({ message: "id defined" });

  try {
    const result = await dbService.executeTransaction(async () => {
      await dbService.query(
        `INSERT INTO incident (description, is_solved, added_date, material_id, auditorium_id) VALUES (?,?,?,?,?)`,
        [description, is_solved, added_date, material.id, auditorium.id]
      );
      return await fetchIncidents();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'ajout de l'incident",
      error: error.message,
    });
  }
};

const deleteIncidentById = async (req, res) => {
  const incidentId = req.params.id;

  try {
    const result = await dbService.executeTransaction(async () => {
      await dbService.query(`DELETE FROM incident WHERE id = ?`, [incidentId]);
      return await fetchIncidents();
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'incident",
      error: error.message,
    });
  }
};

module.exports = {
  getIncidents,
  updateIncident,
  addIncident,
  deleteIncidentById,
};
