const { Router } = require("express");
const { User } = require("../models/userSchema");
const { setuser } = require("../services/auth");
const { OTP } = require("../models/otpSchema");
const { sendOtp } = require("../utils/sendotp");
const router = Router();
const jwt = require("jsonwebtoken");
const { requireAuth } = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profilepics/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

router.post("/signup", async (req, res) => {
  try {
    const { fullname, username, email } = req.body;

    if (!fullname || !username || !email) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
  { email },
  { fullname, username, email, otp, createdAt: new Date() },
  { upsert: true, new: true }
);


    await sendOtp(email, otp);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });
    res.json({ success: true, message: "OTP verified. Please set your password now.", resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

router.post("/set-password", async (req, res) => {
  try {
    const { password, resetToken } = req.body;

    if (!resetToken) {
      return res.status(400).json({ error: "JWT must be provided" });
    }

    console.log("Received resetToken:", resetToken);
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    const otpRecord = await OTP.findOne({ email: decoded.email });
    console.log("Found OTP record:", otpRecord);

    if (!otpRecord) {
      return res.status(400).json({ error: "No OTP record found. Please signup again." });
    }

    const user = await User.create({
      fullname: otpRecord.fullname,
      username: otpRecord.username,
      email: otpRecord.email,
      password
    });

    await OTP.deleteMany({ email: otpRecord.email });

    const token = setuser(user);

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.salt;

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Password setup failed" });
  }
});



router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const token = await User.matchuserandgettoken(email,password);
    const user = await User.findOne({ email }).select("-password -salt");

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(401).json({ error: err.message || "Invalid credentials" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
  { email },
  { email, otp, createdAt: new Date() },
  { upsert: true, new: true }
);


    await sendOtp(email, otp);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });

    res.json({ success: true, message: "OTP verified. You can reset your password.", resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
});

router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: "Reset token and new password are required" });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email: decoded.email });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Password reset failed" });
  }
});

// Profile & User Management

router.get("/me", requireAuth("token"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -salt");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.put("/update-profile", requireAuth("token"), async (req, res) => {
  try {
    const { fullname, username } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (fullname) user.fullname = fullname;
    if (username) user.username = username;

    await user.save();

    res.json({ success: true, message: "Profile updated successfully", user: { fullname: user.fullname, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

router.put("/change-password", requireAuth("token"), async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both old and new passwords are required" });
    }

    await User.matchuserandgettoken(req.user.email, oldPassword);

    const user = await User.findById(req.user._id);
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/update-profile-pic", requireAuth("token"), upload.single("profilePic"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const profilePicPath = "Backend/uploads/profilepics/" + req.file.filename;

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profilePic: profilePicPath },
        { new: true }
      );

      res.json({ message: "Profile picture updated", user: updatedUser });
    } catch (err) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// toke refresh and logout



router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});


module.exports = { router };