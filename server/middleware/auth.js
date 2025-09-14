const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "No user found with this token",
        })
      }

      if (user.isBlocked) {
        return res.status(401).json({
          success: false,
          message: "Your account has been blocked",
        })
      }

      req.user = user
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    })
  }
}

module.exports = { protect, adminOnly }
