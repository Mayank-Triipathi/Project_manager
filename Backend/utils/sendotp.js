const SibApiV3Sdk = require("@sendinblue/client");

const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
brevo.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY // we'll put your key here
);

async function sendOtp(email, otp) {
  try {
    console.log("BREVO API Key starts with:", process.env.BREVO_API_KEY?.slice(0, 10));

    const response = await brevo.sendTransacEmail({
      sender: { name: "Project Manager", email: "minkut2005@gmail.com" },
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent: `
        <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #ddd;border-radius:10px;">
          <h2>🔐 Your OTP Code</h2>
          <p style="font-size:16px;">Your OTP is:</p>
          <h1 style="color:#007bff;letter-spacing:3px;">${otp}</h1>
          <p style="font-size:14px;color:#555;">It will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log("✅ OTP email sent via Brevo:", response);
  } catch (err) {
    console.error("❌ Error sending OTP via Brevo:", err.message);
  }
}

module.exports = { sendOtp };
