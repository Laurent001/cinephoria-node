const mariadbService = require("../../services/mariadb.service");
const QRCode = require("qrcode");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const getQRCode = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res
        .status(400)
        .json({ error: "Informations de réservation manquantes" });
    }
    const result = await fetchQRCodeByBookingId(bookingId);

    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    res.status(500).json({ error: "Erreur lors de la génération du QR code" });
  }
};

const fetchQRCodeByBookingId = async (bookingId) => {
  try {
    const bookingInfo = await fetchQRCodeInfo(bookingId);
    if (!bookingInfo) {
      return res
        .status(404)
        .json({ error: "Aucune réservation trouvée avec cet ID" });
    }

    const token = jwt.sign(
      {
        ...bookingInfo,
        createdAt: new Date().toISOString(),
        exp: Math.floor(
          new Date(bookingInfo.screening_end_time).getTime() / 1000
        ),
      },
      JWT_SECRET
    );

    const qrCodeImage = await QRCode.toDataURL(token);

    return {
      image: qrCodeImage,
      token,
    };
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    res.status(500).json({ error: "Erreur lors de la génération du QR code" });
  }
};

const fetchQRCodeInfo = async (bookingId) => {
  return await mariadbService.query(
    `SELECT 
      b.id AS booking_id, 
      u.email AS user_email, 
      u.first_name AS user_first_name, 
      u.last_name AS user_last_name, 
      b.added_date AS booking_added_date, 
      b.total_price AS booking_total_price, 
      GROUP_CONCAT(s.number SEPARATOR ', ') AS seat_numbers,
      sc.start_time AS screening_start_time, 
      sc.end_time AS screening_end_time, 
      a.name AS auditorium_name, 
      q.name AS quality_name, 
      c.name AS cinema_name, 
      f.title AS film_title 
    FROM 
      booking b 
      INNER JOIN booking_screening_seat bsc ON bsc.booking_id = b.id 
      INNER JOIN user u ON u.id = b.user_id 
      INNER JOIN seat s ON s.id = bsc.seat_id 
      INNER JOIN screening sc ON sc.id = bsc.screening_id 
      INNER JOIN film f ON f.id = sc.film_id 
      INNER JOIN auditorium a ON a.id = s.auditorium_id 
      INNER JOIN quality q ON q.id = a.quality_id 
      INNER JOIN cinema c ON c.id = a.cinema_id 
    WHERE 
      b.id =  ?`,
    [bookingId]
  );
};

const verifyQRCode = async (req, res) => {
  try {
    const { qrcode } = req.params;
    console.log("qrcode : ", qrcode);
    if (!qrcode) {
      return res.status(400).json({ error: "qrcode manquant" });
    }

    const decoded = jwt.verify(qrcode, JWT_SECRET);

    // TODO : remplacer true par plus de vérifications: si existe tjrs en base par ex
    const isValid = true;

    if (isValid) {
      res.json({
        valid: true,
        booking: decoded,
      });
    } else {
      res.json({
        valid: false,
        message: "Réservation non valide ou expirée",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du QR code:", error);
    res.status(400).json({
      valid: false,
      message: "QR code invalide ou expiré",
    });
  }
};

module.exports = {
  getQRCode,
  fetchQRCodeInfo,
  fetchQRCodeByBookingId,
  verifyQRCode,
};
