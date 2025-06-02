import transport from "../config/emailConfig.js";

const sendEmail = (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: "noreply@cinephoria.com",
    to: to,
    subject: subject,
    text: text,
  };

  return transport.sendMail(mailOptions);
};

export { sendEmail };
