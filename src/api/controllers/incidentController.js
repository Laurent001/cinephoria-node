const dbService = require("../../services/database.service");

const getIncidents = async (req, res) => {
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
      return res.status(404).json({ message: "Aucun incident trouvé" });
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

    res.json(incidents);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des incidents",
      error: error.message,
    });
  }
};

const setIncident = async (req, res) => {
  const {
    id: incident_id,
    description,
    added_date,
    is_solved,
    material: { id: material_id, name: material_name },
    auditorium: { id: auditorium_id, name: auditorium_name },
  } = req.body;

  const formattedDate = new Date(added_date)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  try {
    const result = await dbService.executeTransaction(async (connection) => {
      await connection.query(
        `UPDATE incident
        SET
          description = ?,
          added_date = ?,
          is_solved = ?
        WHERE id = ?`,
        [description, formattedDate, is_solved, incident_id]
      );

      await connection.query(
        `UPDATE material
        SET
          name = ?
        WHERE id = ?`,
        [material_name, material_id]
      );

      await connection.query(
        `UPDATE auditorium
        SET
          name = ?
        WHERE id = ?`,
        [auditorium_name, auditorium_id]
      );

      return { success: true, message: "Mise à jour réussie" };
    });

    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la mise à jour" });
  }
};

const deleteIncidentById = async (req, res) => {
  const incidentId = req.params.id;
  try {
    await dbService.query(`DELETE FROM incident WHERE id = ?`, [incidentId]);

    res.json(204);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'incident",
      error: error.message,
    });
  }
};

module.exports = {
  getIncidents,
  setIncident,
  deleteIncidentById,
};
