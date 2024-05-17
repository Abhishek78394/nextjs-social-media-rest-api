import nodemailer from "nodemailer";

export const sendEmail = async ({ toEmail, mailSubject, locale }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"aj " <abhi78394@gmail.com>',
      to: toEmail,
      subject: mailSubject,
      html: `<p>${locale.otpNumber}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
