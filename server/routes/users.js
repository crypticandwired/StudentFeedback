const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const { protect } = require("../middleware/auth")
const { upload, uploadToCloudinary } = require("../utils/cloudinary")

const router = express.Router()

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  "/profile",
  protect,
  upload.single("profilePicture"),
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("phone")
      .optional()
      .matches(/^\d{10}$/)
      .withMessage("Please enter a valid 10-digit phone number"),
    body("dateOfBirth").optional().isISO8601().withMessage("Please enter a valid date of birth"),
    body("address")
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage("Address must be between 5 and 200 characters"),
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

      const { name, phone, dateOfBirth, address } = req.body
      const updateData = {}

      // Add fields to update if provided
      if (name) updateData.name = name
      if (phone) updateData.phone = phone
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth
      if (address) updateData.address = address

      // Handle profile picture upload
      if (req.file) {
        try {
          const result = await uploadToCloudinary(req.file.buffer, "student-feedback/profiles")
          updateData.profilePicture = result.secure_url
        } catch (uploadError) {
          console.error("Image upload error:", uploadError)
          return res.status(400).json({
            success: false,
            message: "Error uploading profile picture",
          })
        }
      }

      const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
      })

      res.json({
        success: true,
        message: "Profile updated successfully",
        user,
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
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

      const { currentPassword, newPassword } = req.body

      // Get user with password
      const user = await User.findById(req.user.id).select("+password")

      // Check current password
      const isCurrentPasswordMatch = await user.comparePassword(currentPassword)
      if (!isCurrentPasswordMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({
        success: true,
        message: "Password changed successfully",
      })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

module.exports = router
