const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Feedback = require("../models/Feedback")
const Course = require("../models/Course")
const { protect } = require("../middleware/auth")

const router = express.Router()

// @desc    Submit new feedback
// @route   POST /api/feedback
// @access  Private (Students only)
router.post(
  "/",
  protect,
  [
    body("course").isMongoId().withMessage("Valid course ID is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("message")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters"),
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

      // Check if user is a student
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          message: "Only students can submit feedback",
        })
      }

      const { course, rating, message } = req.body

      // Check if course exists and is active
      const courseExists = await Course.findOne({ _id: course, isActive: true })
      if (!courseExists) {
        return res.status(404).json({
          success: false,
          message: "Course not found or inactive",
        })
      }

      // Check if student already submitted feedback for this course
      const existingFeedback = await Feedback.findOne({
        student: req.user.id,
        course: course,
      })

      if (existingFeedback) {
        return res.status(400).json({
          success: false,
          message: "You have already submitted feedback for this course",
        })
      }

      // Create feedback
      const feedback = await Feedback.create({
        student: req.user.id,
        course,
        rating,
        message,
      })

      // Populate the feedback with course and student details
      await feedback.populate([
        { path: "course", select: "name code instructor" },
        { path: "student", select: "name email" },
      ])

      res.status(201).json({
        success: true,
        message: "Feedback submitted successfully",
        feedback,
      })
    } catch (error) {
      console.error("Submit feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @desc    Get student's own feedback
// @route   GET /api/feedback/my-feedback
// @access  Private (Students only)
router.get(
  "/my-feedback",
  protect,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
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

      // Check if user is a student
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          message: "Only students can view their feedback",
        })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const skip = (page - 1) * limit

      // Get total count
      const total = await Feedback.countDocuments({ student: req.user.id })

      // Get feedback with pagination
      const feedback = await Feedback.find({ student: req.user.id })
        .populate("course", "name code instructor credits")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      res.json({
        success: true,
        feedback,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    } catch (error) {
      console.error("Get my feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private (Students only - own feedback)
router.put(
  "/:id",
  protect,
  [
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("message")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Message must be between 10 and 1000 characters"),
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

      // Check if user is a student
      if (req.user.role !== "student") {
        return res.status(403).json({
          success: false,
          message: "Only students can update feedback",
        })
      }

      const feedback = await Feedback.findOne({
        _id: req.params.id,
        student: req.user.id,
      })

      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: "Feedback not found or you don't have permission to update it",
        })
      }

      const { rating, message } = req.body
      const updateData = {}

      if (rating) updateData.rating = rating
      if (message) updateData.message = message

      const updatedFeedback = await Feedback.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      }).populate("course", "name code instructor")

      res.json({
        success: true,
        message: "Feedback updated successfully",
        feedback: updatedFeedback,
      })
    } catch (error) {
      console.error("Update feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Students only - own feedback)
router.delete("/:id", protect, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can delete feedback",
      })
    }

    const feedback = await Feedback.findOne({
      _id: req.params.id,
      student: req.user.id,
    })

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found or you don't have permission to delete it",
      })
    }

    await Feedback.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Feedback deleted successfully",
    })
  } catch (error) {
    console.error("Delete feedback error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Get all active courses for feedback submission
// @route   GET /api/feedback/courses
// @access  Private (Students only)
router.get("/courses", protect, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view courses",
      })
    }

    // Get all active courses
    const courses = await Course.find({ isActive: true })
      .select("name code instructor credits description")
      .sort({ name: 1 })

    // Get courses for which student has already submitted feedback
    const submittedFeedback = await Feedback.find({ student: req.user.id }).select("course").populate("course", "_id")

    const submittedCourseIds = submittedFeedback.map((f) => f.course._id.toString())

    // Mark courses as submitted or available
    const coursesWithStatus = courses.map((course) => ({
      ...course.toObject(),
      hasSubmittedFeedback: submittedCourseIds.includes(course._id.toString()),
    }))

    res.json({
      success: true,
      courses: coursesWithStatus,
    })
  } catch (error) {
    console.error("Get courses error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
