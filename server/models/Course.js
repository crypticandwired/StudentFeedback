const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      maxlength: [100, "Course name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, "Course code cannot exceed 10 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    instructor: {
      type: String,
      required: [true, "Instructor name is required"],
      trim: true,
      maxlength: [50, "Instructor name cannot exceed 50 characters"],
    },
    credits: {
      type: Number,
      required: [true, "Credits are required"],
      min: [1, "Credits must be at least 1"],
      max: [6, "Credits cannot exceed 6"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Course", courseSchema)
