const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOtp(email, otp) {
  const msg = {
    to: email,
    from: "minkut2005@gmail.com", // ✅ Verified sender in SendGrid
    subject: "Project Manager - Your OTP Code 🔐",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 400px; background: #f9f9ff;">
        <h2 style="color: #2c3e50;">🔐 Project Manager Verification</h2>
        <p style="font-size: 16px;">Here is your One-Time Password (OTP):</p>
        <h1 style="color: #007bff; letter-spacing: 2px; text-align: center;">${otp}</h1>
        <p style="font-size: 14px; color: #555;">This OTP will expire in <strong>5 minutes</strong>. Please do not share it with anyone.</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #888;">Sent securely by <strong>Project Manager</strong>.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ OTP email sent successfully to: ${email}`);
  } catch (err) {
    console.error("❌ SendGrid Error:", err.response?.body || err.message);
  }
}

module.exports = { sendOtp };
