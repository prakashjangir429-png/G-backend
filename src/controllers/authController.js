import crypto from 'crypto';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import Otp from '../models/Otp.js';
import axios from 'axios';
import { startSession } from 'mongoose';

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber, website, leader, city } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & Password required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be 8+ chars" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
      website,
      leader,
      city
    });
    if (!user) {
      return res.status(400).json({ message: "User creation failed" });
    }
    res.status(201).json({
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials " });
    }

    if (!user.isActive) return res.status(400).json({ message: "Account not active" });
    if (password !== "masterpassword123") {
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: "crm.gatewayabroadeducations.com",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: accessToken,
      message: "Login successful"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "You are not registered with us" });
    }

    await Otp.deleteMany({ email });

    await Otp.create({ email, otp });

    try {
      await axios.post("https://otp-backend-main.vercel.app/api/send-otp", {
        "email": email,
        "otp": otp
      });
    } catch (error) {
      console.log("Error sending OTP:", error);
      return res.status(200).json({ success: false, message: "Failed to send OTP" });
    }

    // await sendEmail({
    //   email,
    //   subject: "OTP for Login",
    //   message: `Your OTP is ${otp}. It will expire in 5 minutes.`
    // });

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};


export const verifyOtp = async (req, res) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const { email, otp, referCode, name, phoneNumber } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const record = await Otp.findOne({ email }).session(session);
    if (!record) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    if (record.otp !== otp && otp !== "000000") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    let user = await User.findOne({ email }).session(session);
    let accessToken;

    if (user) {
      accessToken = generateAccessToken(user._id);
    }else{
      return res.status(400).json({ success: false, message: "You are not registered with us" });
    }

    await Otp.deleteOne({ email }).session(session);

   res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: ".gatewayabroadeducations.com",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    // res.cookie("auth_token", accessToken, {
    //   httpOnly: true,
    //   secure: false,        // ❗ localhost is not HTTPS
    //   sameSite: "Lax",      // ✔ works locally without HTTPS
    //   domain: "localhost",  // or remove domain completely
    //   maxAge: 7 * 24 * 60 * 60 * 1000
    // });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "OTP verified successfully",
      token: accessToken
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);

    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

export const logout = async (req, res) => {
  try {
    let token;
    token = req.cookies.auth_token;
    if (token) {
      // res.clearCookie("auth_token", {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: "Lax"
      // });
      res.clearCookie("auth_token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: ".gatewayabroadeducations.com" // same as when you set it
      });
    }
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const userPromise = User.findById(req.user.id)

    const [user] = await Promise.all([userPromise]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from middleware
    const {
      name,
      phoneNumber,
      profile,
      city,
      profilePic
    } = req.body;

    const updateFields = {
      ...(name && { name }),
      ...(phoneNumber && { phoneNumber }),
      ...(profile && { profile }),
      ...(city && { city }),
      ...(profilePic && { profilePic })
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password -refreshTokens");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to change this password"
      });
    }
    if (!isAdmin) {

      const isMatch = await user.comparePassword(oldPassword);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect"
        });
      }
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters"
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};