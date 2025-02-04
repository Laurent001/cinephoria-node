const transport = require("../config/emailConfig");

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: "noreply@cinephoria.com",
    to: to,
    subject: subject,
    text: text,
  };

  return transport.sendMail(mailOptions);
};

const sendEmailContact = (email, subject, text) => {
  const mailOptions = {
    from: email,
    to: "support@cinephoria.com",
    subject: subject,
    text: text,
  };

  return transport.sendMail(mailOptions);
};

module.exports = { sendEmail, sendEmailContact };
