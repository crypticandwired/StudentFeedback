const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const generateToken = require("../utils/generateToken")
const { protect } = require("../middleware/auth")

const router = express.Router()

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    body("phone")
      .matches(/^\d{10}$/)
      .withMessage("Please enter a valid 10-digit phone number"),
    body("dateOfBirth").isISO8601().withMessage("Please enter a valid date of birth"),
    body("address").trim().isLength({ min: 5, max: 200 }).withMessage("Address must be between 5 and 200 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, email, password, phone, dateOfBirth, address } = req.body

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        })
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        dateOfBirth,
        address,
      })

      const token = generateToken(user._id)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: user,
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during registration",
      })
    }
  },
)

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      const user = await User.findOne({ email }).select("+password")
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        })
      }

      if (user.isBlocked) {
        return res.status(401).json({
          success: false,
          message: "Your account has been blocked. Please contact administrator.",
        })
      }

      const isPasswordMatch = await user.comparePassword(password)
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        })
      }

      const token = generateToken(user._id)

      const userProfile = await User.findById(user._id);

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: userProfile,
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during login",
      })
    }
  },
)

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
router.post(
  "/admin-login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      const user = await User.findOne({ email, role: "admin" }).select("+password")
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        })
      }

      const isPasswordMatch = await user.comparePassword(password)
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        })
      }

      const token = generateToken(user._id)
      
      const userProfile = await User.findById(user._id);

      res.json({
        success: true,
        message: "Admin login successful",
        token,
        user: userProfile,
      })
    } catch (error) {
      console.error("Admin login error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during admin login",
      })
    }
  },
)

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router