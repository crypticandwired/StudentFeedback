const express = require("express")
const { body, validationResult, query } = require("express-validator")
const User = require("../models/User")
const Course = require("../models/Course")
const Feedback = require("../models/Feedback")
const { protect, adminOnly } = require("../middleware/auth")
const createCsvWriter = require("csv-writer").createObjectCsvWriter

const router = express.Router()

// Apply admin protection to all routes
router.use(protect, adminOnly)

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get("/dashboard", async (req, res) => {
  try {
    // Get basic counts
    const [totalStudents, totalCourses, totalFeedback, blockedStudents] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Feedback.countDocuments(),
      User.countDocuments({ role: "student", isBlocked: true }),
    ])

    // Get average rating
    const ratingStats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ])

    // Get feedback by rating distribution
    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Get recent feedback
    const recentFeedback = await Feedback.find()
      .populate("student", "name email")
      .populate("course", "name code")
      .sort({ createdAt: -1 })
      .limit(5)

    // Get course ratings
    const courseRatings = await Feedback.aggregate([
      {
        $group: {
          _id: "$course",
          averageRating: { $avg: "$rating" },
          totalFeedback: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      { $sort: { averageRating: -1 } },
      { $limit: 10 },
    ])

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalFeedback,
        blockedStudents,
        averageRating: ratingStats[0]?.averageRating || 0,
        ratingDistribution,
        recentFeedback,
        courseRatings,
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Get all feedback with filters
// @route   GET /api/admin/feedback
// @access  Private (Admin only)
router.get(
  "/feedback",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("course").optional().isMongoId().withMessage("Invalid course ID"),
    query("student").optional().isMongoId().withMessage("Invalid student ID"),
    query("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
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

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit

      // Build filter object
      const filter = {}
      if (req.query.course) filter.course = req.query.course
      if (req.query.student) filter.student = req.query.student
      if (req.query.rating) filter.rating = Number.parseInt(req.query.rating)

      // Get total count
      const total = await Feedback.countDocuments(filter)

      // Get feedback with pagination
      const feedback = await Feedback.find(filter)
        .populate("student", "name email phone")
        .populate("course", "name code instructor")
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
      console.error("Get feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @desc    Export feedback data to CSV
// @route   GET /api/admin/feedback/export
// @access  Private (Admin only)
router.get(
  "/feedback/export",
  [
    query("course").optional().isMongoId().withMessage("Invalid course ID"),
    query("student").optional().isMongoId().withMessage("Invalid student ID"),
    query("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    query("startDate").optional().isISO8601().withMessage("Invalid start date"),
    query("endDate").optional().isISO8601().withMessage("Invalid end date"),
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

      // Build filter object
      const filter = {}
      if (req.query.course) filter.course = req.query.course
      if (req.query.student) filter.student = req.query.student
      if (req.query.rating) filter.rating = Number.parseInt(req.query.rating)

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {}
        if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate)
        if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate)
      }

      // Get feedback data
      const feedback = await Feedback.find(filter)
        .populate("student", "name email phone")
        .populate("course", "name code instructor credits")
        .sort({ createdAt: -1 })

      // Prepare CSV data
      const csvData = feedback.map((item) => ({
        feedbackId: item._id.toString(),
        studentName: item.student.name,
        studentEmail: item.student.email,
        studentPhone: item.student.phone,
        courseName: item.course.name,
        courseCode: item.course.code,
        instructor: item.course.instructor,
        credits: item.course.credits,
        rating: item.rating,
        message: item.message.replace(/\n/g, " ").replace(/,/g, ";"), // Clean message for CSV
        submittedDate: item.createdAt.toISOString().split("T")[0],
        submittedTime: item.createdAt.toISOString().split("T")[1].split(".")[0],
      }))

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0]
      const filename = `feedback-export-${timestamp}.csv`

      // Set response headers for CSV download
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)

      // Create CSV content
      const header =
        "Feedback ID,Student Name,Student Email,Student Phone,Course Name,Course Code,Instructor,Credits,Rating,Feedback Message,Submitted Date,Submitted Time\n"
      const csvContent = csvData
        .map((row) =>
          [
            row.feedbackId,
            `"${row.studentName}"`,
            row.studentEmail,
            row.studentPhone,
            `"${row.courseName}"`,
            row.courseCode,
            `"${row.instructor}"`,
            row.credits,
            row.rating,
            `"${row.message}"`,
            row.submittedDate,
            row.submittedTime,
          ].join(","),
        )
        .join("\n")

      res.send(header + csvContent)
    } catch (error) {
      console.error("Export feedback error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during export",
      })
    }
  },
)

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin only)
router.get(
  "/students",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().isLength({ min: 1 }).withMessage("Search term cannot be empty"),
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

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 20
      const skip = (page - 1) * limit
      const search = req.query.search

      // Build filter object
      const filter = { role: "student" }
      if (search) {
        filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
      }

      // Get total count
      const total = await User.countDocuments(filter)

      // Get students with pagination
      const students = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

      // Get feedback count for each student
      const studentsWithStats = await Promise.all(
        students.map(async (student) => {
          const feedbackCount = await Feedback.countDocuments({ student: student._id })
          return {
            ...student.toObject(),
            feedbackCount,
          }
        }),
      )

      res.json({
        success: true,
        students: studentsWithStats,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      })
    } catch (error) {
      console.error("Get students error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @desc    Block/Unblock student
// @route   PUT /api/admin/students/:id/block
// @access  Private (Admin only)
router.put("/students/:id/block", async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "student" })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    student.isBlocked = !student.isBlocked
    await student.save()

    res.json({
      success: true,
      message: `Student ${student.isBlocked ? "blocked" : "unblocked"} successfully`,
      student,
    })
  } catch (error) {
    console.error("Block student error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Delete student
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin only)
router.delete("/students/:id", async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: "student" })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Delete all feedback by this student
    await Feedback.deleteMany({ student: req.params.id })

    // Delete the student
    await User.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Student and their feedback deleted successfully",
    })
  } catch (error) {
    console.error("Delete student error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private (Admin only)
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 })

    // Get feedback stats for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const feedbackStats = await Feedback.aggregate([
          { $match: { course: course._id } },
          {
            $group: {
              _id: null,
              totalFeedback: { $sum: 1 },
              averageRating: { $avg: "$rating" },
            },
          },
        ])

        return {
          ...course.toObject(),
          totalFeedback: feedbackStats[0]?.totalFeedback || 0,
          averageRating: feedbackStats[0]?.averageRating || 0,
        }
      }),
    )

    res.json({
      success: true,
      courses: coursesWithStats,
    })
  } catch (error) {
    console.error("Get courses error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Create course
// @route   POST /api/admin/courses
// @access  Private (Admin only)
router.post(
  "/courses",
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Course name must be between 2 and 100 characters"),
    body("code")
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage("Course code must be between 2 and 10 characters")
      .toUpperCase(),
    body("description")
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Description must be between 10 and 500 characters"),
    body("instructor")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Instructor name must be between 2 and 50 characters"),
    body("credits").isInt({ min: 1, max: 6 }).withMessage("Credits must be between 1 and 6"),
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

      const { name, code, description, instructor, credits } = req.body

      // Check if course code already exists
      const existingCourse = await Course.findOne({ code })
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: "Course code already exists",
        })
      }

      const course = await Course.create({
        name,
        code,
        description,
        instructor,
        credits,
      })

      res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      })
    } catch (error) {
      console.error("Create course error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Private (Admin only)
router.put(
  "/courses/:id",
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Course name must be between 2 and 100 characters"),
    body("code")
      .optional()
      .trim()
      .isLength({ min: 2, max: 10 })
      .withMessage("Course code must be between 2 and 10 characters")
      .toUpperCase(),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage("Description must be between 10 and 500 characters"),
    body("instructor")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Instructor name must be between 2 and 50 characters"),
    body("credits").optional().isInt({ min: 1, max: 6 }).withMessage("Credits must be between 1 and 6"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
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

      const course = await Course.findById(req.params.id)
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        })
      }

      // Check if new code conflicts with existing course
      if (req.body.code && req.body.code !== course.code) {
        const existingCourse = await Course.findOne({ code: req.body.code })
        if (existingCourse) {
          return res.status(400).json({
            success: false,
            message: "Course code already exists",
          })
        }
      }

      const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })

      res.json({
        success: true,
        message: "Course updated successfully",
        course: updatedCourse,
      })
    } catch (error) {
      console.error("Update course error:", error)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin only)
router.delete("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if course has feedback
    const feedbackCount = await Feedback.countDocuments({ course: req.params.id })
    if (feedbackCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course with existing feedback. Deactivate it instead.",
      })
    }

    await Course.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error("Delete course error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Get advanced analytics and trends
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
router.get("/analytics", async (req, res) => {
  try {
    // Monthly feedback trends (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyTrends = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Course performance analytics
    const coursePerformance = await Feedback.aggregate([
      {
        $group: {
          _id: "$course",
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratings: { $push: "$rating" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $addFields: {
          ratingDistribution: {
            5: {
              $size: {
                $filter: {
                  input: "$ratings",
                  cond: { $eq: ["$$this", 5] },
                },
              },
            },
            4: {
              $size: {
                $filter: {
                  input: "$ratings",
                  cond: { $eq: ["$$this", 4] },
                },
              },
            },
            3: {
              $size: {
                $filter: {
                  input: "$ratings",
                  cond: { $eq: ["$$this", 3] },
                },
              },
            },
            2: {
              $size: {
                $filter: {
                  input: "$ratings",
                  cond: { $eq: ["$$this", 2] },
                },
              },
            },
            1: {
              $size: {
                $filter: {
                  input: "$ratings",
                  cond: { $eq: ["$$this", 1] },
                },
              },
            },
          },
        },
      },
      { $sort: { averageRating: -1 } },
    ])

    // Student engagement analytics
    const studentEngagement = await Feedback.aggregate([
      {
        $group: {
          _id: "$student",
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          lastFeedback: { $max: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      { $sort: { totalFeedback: -1 } },
      { $limit: 10 },
    ])

    // Rating trends over time
    const ratingTrends = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            rating: "$rating",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
          },
          ratings: {
            $push: {
              rating: "$_id.rating",
              count: "$count",
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ])

    // Instructor performance
    const instructorPerformance = await Feedback.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $group: {
          _id: "$course.instructor",
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          courses: { $addToSet: "$course.name" },
        },
      },
      { $sort: { averageRating: -1 } },
    ])

    res.json({
      success: true,
      analytics: {
        monthlyTrends,
        coursePerformance,
        studentEngagement,
        ratingTrends,
        instructorPerformance,
      },
    })
  } catch (error) {
    console.error("Analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching analytics",
    })
  }
})

module.exports = router
