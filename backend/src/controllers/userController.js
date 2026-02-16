import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * DUPLICATE USER PREVENTION IN SIGNUP
 *
 * Issue: Race condition between check and create
 * Old flow:
 * 1. Check if user exists
 * 2. If not, create user
 * Problem: Two simultaneous requests can both pass step 1 and create duplicates
 *
 * Fix: Use findOneAndUpdate with upsert
 * - Atomic operation prevents race conditions
 * - Database handles uniqueness at constraint level
 * - Gracefully handles duplicate key errors (code 11000)
 */

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    // Use findOneAndUpdate with upsert to prevent race conditions
    const user = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          name,
          email,
          passwordHash,
          tier: "free",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    // Check if user already had a password (meaning it already existed)
    if (user.passwordHash && user.passwordHash !== passwordHash) {
      return res.status(400).json({
        ok: false,
        message: "User already exists",
      });
    }

    res.status(200).json({
      ok: true,
      message: "User created successfully!",
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        ok: false,
        message: "User already exists",
        error: "Duplicate email",
      });
    }
    return res.status(500).json({
      ok: false,
      message: "Signup failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User doesnot exist in db",
      });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(404).json({
        ok: false,
        message: "Password doesnot match",
      });
    }
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      ok: true,
      message: "Login Successfull",
      token,
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Internal server error!!",
      error: error.message,
    });
  }
};

//user attempt route

export const upsertAttempt = async (req, res) => {
  try {
    const { userId } = req.body;
    const attemptObj = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }
    await user.upsertAttempt(attemptObj);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Some error has occured in usertAttempt",
      error: error.message,
    });
  }
};
