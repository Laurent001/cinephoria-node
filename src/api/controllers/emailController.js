const validator = require("validator");

const {
  sendEmail,
  sendEmailContact,
} = require("../../services/mailer.service");

const sendWelcome = (email, name) => {
  sendEmail(email, "Bienvenue!", `Hello ${name}, bienvenue chez cinephoria!`)
    .then(() => console.log("Email envoyé"))
    .catch((error) => console.error("Error sending email:", error));
};

// to: 'contact@cinephoria.com',
// name: '',
// email: '',
// subject: '',
// message: '',

const sendContact = async (req, res) => {
  const { contact } = req.body;

  if (!validator.isEmail(contact.email)) {
    return res.status(400).json({ error: "Adresse e-mail invalide" });
  }

  sendEmailContact(
    contact.email,
    contact.subject,
    `name : ${contact.name}\nfrom : ${contact.email}\ntitre: ${contact.titre}\n\nmessage :\n\n${contact.message}`
  )
    .then(() => res.json(true))
    .catch((error) => res.json(false));
};

module.exports = { sendWelcome, sendContact };
