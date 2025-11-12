const nodemailer = require("nodemailer");

async function sendOtp(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,      // your Gmail address
        pass: process.env.EMAIL_PASS,      // your App Password
      },
    });

    const mailOptions = {
      from: `"Project Manager" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #ddd;border-radius:10px;width:fit-content;">
          <h2>🔐 Your OTP Code</h2>
          <p style="font-size:16px;">Your OTP is:</p>
          <h1 style="color:#007bff;letter-spacing:3px;">${otp}</h1>
          <p style="font-size:14px;color:#555;">It will expire in 5 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully:", info.response);
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
  }
}

module.exports = { sendOtp };
