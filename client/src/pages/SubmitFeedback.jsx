"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import Layout from "../components/Layout"
import axios from "axios"
import toast from "react-hot-toast"
import { StarIcon, AcademicCapIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"

const SubmitFeedback = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm()

  const selectedCourse = watch("course")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get("/api/feedback/courses")
      setCourses(response.data.courses)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    if (selectedRating === 0) {
      toast.error("Please select a rating")
      return
    }

    setSubmitting(true)
    try {
      const response = await axios.post("/api/feedback", {
        ...data,
        rating: selectedRating,
      })

      if (response.data.success) {
        toast.success(response.data.message)
        navigate("/feedback/my-feedback")
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit feedback"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const availableCourses = courses.filter((course) => !course.hasSubmittedFeedback)
  const selectedCourseData = courses.find((course) => course._id === selectedCourse)

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Submit Course Feedback</h1>
            <p className="mt-2 text-gray-600">
              Share your experience and help improve the learning experience for future students.
            </p>
          </div>

          <div className="p-6">
            {availableCourses.length === 0 ? (
              <div className="text-center py-8">
                <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available for feedback</h3>
                <p className="text-gray-500">You have already submitted feedback for all available courses.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Course Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                  <select {...register("course", { required: "Please select a course" })} className="input-field">
                    <option value="">Choose a course...</option>
                    {availableCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.code}) - {course.instructor}
                      </option>
                    ))}
                  </select>
                  {errors.course && <p className="mt-1 text-sm text-red-600">{errors.course.message}</p>}
                </div>

                {/* Course Details */}
                {selectedCourseData && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{selectedCourseData.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Code:</span> {selectedCourseData.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Instructor:</span> {selectedCourseData.instructor}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Credits:</span> {selectedCourseData.credits}
                    </p>
                    {selectedCourseData.description && (
                      <p className="text-sm text-gray-600 mt-2">{selectedCourseData.description}</p>
                    )}
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="focus:outline-none"
                      >
                        {star <= selectedRating ? (
                          <StarIconSolid className="h-8 w-8 text-yellow-400" />
                        ) : (
                          <StarIcon className="h-8 w-8 text-gray-300 hover:text-yellow-400" />
                        )}
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {selectedRating > 0 ? `${selectedRating}/5` : "Select rating"}
                    </span>
                  </div>
                </div>

                {/* Feedback Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                  <textarea
                    {...register("message", {
                      required: "Please provide your feedback",
                      minLength: {
                        value: 10,
                        message: "Feedback must be at least 10 characters",
                      },
                      maxLength: {
                        value: 1000,
                        message: "Feedback cannot exceed 1000 characters",
                      },
                    })}
                    rows={6}
                    className="input-field"
                    placeholder="Share your thoughts about the course, instructor, content, assignments, etc..."
                  />
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button type="button" onClick={() => navigate("/dashboard")} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SubmitFeedback
