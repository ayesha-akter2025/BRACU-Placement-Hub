import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// --- FIX 1: Removed the top-level JWT_SECRET constant ---

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    await Otp.deleteMany({ email });
    
    await Otp.create({ 
      email, 
      code, 
      expiresAt,
      userData: { name, password, role: role || "student" }
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email - BRACU Placement Hub",
        text: `Welcome to BRACU Placement Hub!\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.`
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
      return res.status(500).json({ msg: "Failed to send verification email. Check server logs." });
    }

    res.json({ 
      msg: "OTP sent to email. Please verify to complete registration.",
      email 
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const record = await Otp.findOne({ email, code: otp });
    if (!record) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already registered" });
    }

    const { name, password, role } = record.userData;
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await User.create({ 
      name, 
      email, 
      passwordHash,
      role,
      isVerified: true 
    });

    await Otp.deleteOne({ _id: record._id });

    // --- FIX 2: Use process.env directly here ---
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "12h" });

    res.json({
      msg: "Registration successful!",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // --- FIX 3: Use process.env directly here ---
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "12h" });

    res.json({
      msg: "Login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "No account found with this email" });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ email });
    await Otp.create({ email, code, expiresAt });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset - BRACU Placement Hub",
      text: `You requested to reset your password.\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.`
    });

    res.json({ 
      msg: "OTP sent to email for password reset",
      email 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const record = await Otp.findOne({ email, code: otp });
    if (!record) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ msg: "OTP expired" });
    }

    // --- FIX 4: Use process.env directly here ---
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

    await Otp.deleteOne({ _id: record._id });

    res.json({ 
      msg: "OTP verified. You can now reset your password.",
      resetToken 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    let decoded;
    try {
      // --- FIX 5: Use process.env directly here ---
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ msg: "Password reset successful. You can now login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const existingOtp = await Otp.findOne({ email });
    if (!existingOtp) {
      return res.status(400).json({ msg: "No pending verification found" });
    }
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    existingOtp.code = code;
    existingOtp.expiresAt = expiresAt;
    await existingOtp.save();
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "New Verification Code - BRACU Placement Hub",
      text: `Your new verification code is: ${code}\n\nThis code will expire in 10 minutes.`
    });
    res.json({ msg: "New OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const me = async (req, res) => {
  res.json(req.user);
};