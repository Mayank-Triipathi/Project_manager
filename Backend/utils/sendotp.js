const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtp(email, otp) {
  try {
    await resend.emails.send({
      from: "Project Manager <onboarding@resend.dev>", // default Resend sender
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
    });
    console.log("✅ OTP email sent successfully to:", email);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err);
  }
}

module.exports = { sendOtp };
