import { fetchMaterials } from "../api/controllers/materialController.ts";
import mariadbService from "../services/mariadb.service.ts";
import { getErrorMessage } from "../utils/error.ts";

const fetchIncidents = async () => {
  try {
    const rows = await mariadbService.query(
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
        a.seat_handi AS auditorium_seat_handi, 
        a.quality_id AS auditorium_quality_id, 
        c.id AS cinema_id, 
        c.name AS cinema_name, 
        c.address AS cinema_address, 
        c.city AS cinema_city, 
        c.postcode AS cinema_postcode, 
        c.phone AS cinema_phone
      FROM 
        incident i 
        INNER JOIN auditorium a ON a.id = i.auditorium_id 
        INNER JOIN material m ON m.id = i.material_id 
        INNER JOIN cinema c ON c.id = a.cinema_id`
    );

    if (!rows || rows.length === 0) {
      return { incidents: [], error: "Aucun incident trouvé" };
    }

    const incidents = rows.map((row: any) => ({
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
        seat_handi: row.auditorium_seat_handi,
        quality_id: row.auditorium_quality_id,
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

    const materials = await fetchMaterials();
    const auditoriums = await mariadbService.query(`SELECT * FROM auditorium`);

    if (!materials || !auditoriums) {
      return {
        error: "Erreur lors de la récupération des matériaux ou auditoriums",
      };
    }

    return { incidents, auditoriums, materials };
  } catch (error) {
    return {
      error: `Erreur lors de la récupération des incidents: ${getErrorMessage(
        error
      )}`,
    };
  }
};

export { fetchIncidents };
