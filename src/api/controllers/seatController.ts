import mariadbService from "../../services/mariadb.service";

const createSeatsForAuditorium = async (
  auditoriumId: number,
  seat: number,
  seat_handi: number
) => {
  const seats = [];

  for (let i = 1; i <= seat_handi; i++) {
    seats.push([auditoriumId, i, true]);
  }

  for (let i = 1; i <= seat; i++) {
    seats.push([auditoriumId, seat_handi + i, false]);
  }

  const placeholders = seats.map(() => "(?, ?, ?)").join(", ");
  const flatValues = seats.flat();

  await mariadbService.query(
    `INSERT INTO seat (auditorium_id, number, is_handi) VALUES ${placeholders}`,
    flatValues
  );
};

export { createSeatsForAuditorium };
