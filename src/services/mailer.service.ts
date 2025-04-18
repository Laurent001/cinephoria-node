import transport from "../config/emailConfig.ts";

const sendEmail = (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: "noreply@cinephoria.com",
    to: to,
    subject: subject,
    text: text,
  };

  return transport.sendMail(mailOptions);
};

const sendEmailSupport = (email: string, subject: string, text: string) => {
  const mailOptions = {
    from: email,
    to: "support@cinephoria.com",
    subject: subject,
    text: text,
  };

  return transport.sendMail(mailOptions);
};

export { sendEmail, sendEmailSupport };
