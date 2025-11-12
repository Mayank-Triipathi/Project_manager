const axios = require("axios");

async function sendOtp(email, otp) {
  try {
    const response = await axios.post(
      "https://api.elasticemail.com/v2/email/send",
      null,
      {
        params: {
          apikey: process.env.ELASTIC_API_KEY,
          subject: "Your OTP Code",
          from: "minkut2005@gmail.com", // your Gmail
          to: email,
          bodyHtml: `
            <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #ddd;border-radius:10px;width:fit-content;">
              <h2>🔐 Your OTP Code</h2>
              <p style="font-size:16px;">Your OTP is:</p>
              <h1 style="color:#007bff;letter-spacing:3px;">${otp}</h1>
              <p style="font-size:14px;color:#555;">It will expire in 5 minutes.</p>
            </div>
          `,
          isTransactional: true,
        },
      }
    );

    console.log("✅ OTP email sent via Elastic Email:", response.data);
  } catch (err) {
    console.error("❌ Error sending OTP via Elastic Email:", err.response?.data || err);
  }
}

module.exports = { sendOtp };
