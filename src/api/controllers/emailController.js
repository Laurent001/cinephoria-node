const validator = require("validator");

const {
  sendEmail,
  sendEmailSupport,
} = require("../../services/mailer.service");

const sendEmailWelcome = (email, name) => {
  sendEmail(email, "Bienvenue!", `Hello ${name}, bienvenue chez cinephoria!`)
    .then(() => console.log("Email envoyé"))
    .catch((error) => console.error("Error sending email:", error));
};

const sendEmailResetRequest = (email, name, token) => {
  sendEmail(
    email,
    "Réinitialisation de votre mot de passe",
    `Hello ${name},\n\nVous avez demandé la réinitialisation de votre mot de passe.\nMerci de cliquer sur ce lien pour entrer votre nouveau mot de passe :\n\n${process.env.URL_FRONTEND}/password-reset/${token}\n\nCinéphoria\nL\'émotion sur grand écran`
  )
    .then(() => console.log("Email reset envoyé pour : ", email))
    .catch((error) => console.error("Error sending email:", error));
};

const sendEmailResetSuccess = (email, name) => {
  sendEmail(
    email,
    "Mot de passe réintialisé avec succès",
    `Hello ${name},\n\nLa réinitialisation de votre mot de passe a réussi.\nVous pouvez désormais vous connecter avec votre nouveau mot de passe :\n\n ${process.env.URL_FRONTEND}/login \n\nCinéphoria\nL\'émotion sur grand écran`
  )
    .then(() => console.log("Email reset success envoyé pour : ", email))
    .catch((error) => console.error("Error sending reset email:", error));
};

const sendEmailContact = async (req, res) => {
  const { contact } = req.body;

  if (!validator.isEmail(contact.email)) {
    return res.status(400).json({ error: "Adresse e-mail invalide" });
  }

  sendEmailSupport(
    contact.email,
    contact.subject,
    `name : ${contact.name}\nfrom : ${contact.email}\ntitre: ${contact.titre}\n\nmessage :\n\n${contact.message}`
  )
    .then(() => res.json(true))
    .catch((error) => res.json(false));
};

module.exports = {
  sendEmailWelcome,
  sendEmailContact,
  sendEmailResetRequest,
  sendEmailResetSuccess,
};
