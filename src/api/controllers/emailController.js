const validator = require("validator");

const {
  sendEmail,
  sendEmailSupport,
} = require("../../services/mailer.service");

const sendUserEmailWelcome = (email, name) => {
  sendEmail(
    email,
    "Bienvenue!",
    `Hello ${name}, bienvenue chez cinephoria!\n\n Vous pouvez désormais vous connecter avec votre adresse email et votre mot de passe entré lorsde votre inscription.\n\nCinéphoria\nL\'émotion sur grand écran`
  )
    .then(() => console.log("Email utilisateur envoyé"))
    .catch((error) => console.error("Error sending email:", error));
};

const sendStaffEmailWelcome = (email, name, login, password) => {
  sendEmail(
    email,
    "Bienvenue!",
    `Hello ${name}, nous sommes heureux de vous savoir dans notre équipe cinéphoria!\n\nVoici vos identifiants de connexion :\n\nLogin : ${login}\nMot de passe : ${password}\n\nPour toute question ou problème contactez votre administrateur \n\nCinéphoria\nL\'émotion sur grand écran`
  )
    .then(() => console.log("Email employé envoyé"))
    .catch((error) => console.error("Error sending email:", error));
};

const sendAdminEmailWelcome = (email, name, login, password) => {
  sendEmail(
    email,
    "Vous êtes désormais administrateur!",
    `Hello ${name}, nous avez désormais accès à des droits administrateurs, faites-en bon usage!\n\nVoici vos identifiants de connexion :\n\nLogin : ${login}\nMot de passe : ${password}\n\nPour toute question ou problème parlez-en avec vos collègues administrateurs\n\nCinéphoria\nL\'émotion sur grand écran`
  )
    .then(() => console.log("Email admin envoyé"))
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
  sendUserEmailWelcome,
  sendStaffEmailWelcome,
  sendEmailContact,
  sendEmailResetRequest,
  sendEmailResetSuccess,
  sendAdminEmailWelcome,
};
