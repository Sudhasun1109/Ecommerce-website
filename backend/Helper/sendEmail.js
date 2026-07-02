import { text } from "express";
import nodeMailer from "nodemailer";

export const sendEmail = async (options) => {
  console.log(process.env.SMTP_SERVICE);
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOption = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:options.htmlMessage,
  };
  await transporter.sendMail(mailOption);
};
