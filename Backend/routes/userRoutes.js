const { Router } = require("express");
const { User } = require("../models/userSchema");
const { setuser } = require("../services/auth");
const {RegisterValidation,LoginValidation} = require("../Validators/userValidator");

// const { OTP } = require("../models/otpSchema");
// const { sendOtp } = require("../utils/sendotp");

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


// =========================
// SIGNUP (NO OTP REQUIRED)
// =========================

router.post("/signup", async (req, res) => {
  try {
    // const { fullname, username, email, password } = req.body;
    const {data, error} = RegisterValidation.safeParse(req.body);
    if(error){
      return  res.status(400).json({ error: error.errors.map(e=>e.message).join(", ") });
    }
    const { fullname, username, email, password } = data;

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // ❌ OTP LOGIC REMOVED
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // await OTP.findOneAndUpdate(
    //   { email }, { fullname, username, email, otp, createdAt: new Date() },
    //   { upsert: true, new: true }
    // );
    // await sendOtp(email, otp);

    // DIRECTLY CREATE USER
    const user = await User.create({
      fullname,
      username,
      email,
      password
    });

    const token = setuser(user);

    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.salt;

    res.json({ success: true, token, user: safeUser });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});


// =========================
// REMOVE OTP VERIFY ROUTE
// =========================

// router.post("/verify-otp", async (req, res) => {
//   return res.status(400).json({ error: "OTP system disabled" });
// });


// =========================
// REMOVE OTP SET-PASSWORD
// =========================

// router.post("/set-password", async (req, res) => {
//   return res.status(400).json({ error: "OTP system disabled" });
// });


// =========================
// LOGIN
// =========================

router.post("/login", async (req, res) => {
  try {
    // const { email, password } = req.body;
    const {data, error} = LoginValidation.safeParse(req.body);
    if(error){
      return  res.status(400).json({ error: error.errors.map(e=>e.message).join(", ") });
    }
    const { email, password } = data;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const token = await User.matchuserandgettoken(email, password);
    const user = await User.findOne({ email }).select("-password -salt");

    res.json({ success: true, token, user });
  } catch (err) {
    res.status(401).json({ error: err.message || "Invalid credentials" });
  }
});


// =========================
// FORGOT PASSWORD (NO OTP)
// =========================

router.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email & new password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ❌ NO OTP — DIRECT RESET
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// REMOVE OTP VERIFY FOR FORGOT PASSWORD
// router.post("/forgot-password/verify-otp", async () => {});
// router.post("/forgot-password/reset", async () => {});


// =========================
// USER PROFILE
// =========================

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

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        fullname: user.fullname,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
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

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = { router };
