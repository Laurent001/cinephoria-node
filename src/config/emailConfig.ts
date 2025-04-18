import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "0dbb8d69ffd600",
    pass: "84f10f46186782",
  },
});

export default transport;
