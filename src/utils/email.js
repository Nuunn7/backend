const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  await transporter.sendMail({
    from: `"VolunteerChain" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Нууц үг сэргээх хүсэлт',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #00203D;">Нууц үг сэргээх</h2>
        <p>Та нууц үг сэргээх хүсэлт илгээсэн байна. Доорх товчийг дарж нууц үгээ сэргээнэ үү.</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          margin: 16px 0;
          padding: 12px 24px;
          background-color: #00203D;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        ">Нууц үг сэргээх</a>
        <p style="color: #888; font-size: 13px;">
          Энэ холбоос 1 цагийн дараа хүчингүй болно.<br/>
          Хэрэв та энэ хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.
        </p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };