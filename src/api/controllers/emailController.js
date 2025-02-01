const { sendEmail } = require("../../services/mailer.service");

const sendWelcome = (email, name) => {
  sendEmail(email, "Bienvenue!", `Hello ${name}, bienvenue chez cinephoria!`)
    .then(() => console.log("Email envoyé"))
    .catch((error) => console.error("Error sending email:", error));
};

module.exports = { sendWelcome };
