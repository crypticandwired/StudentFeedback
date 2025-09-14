"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Layout from "../components/Layout"
import axios from "axios"
import { DocumentTextIcon, AcademicCapIcon, StarIcon, PlusIcon } from "@heroicons/react/24/outline"

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalFeedback: 0,
    totalCourses: 0,
    averageRating: 0,
  })
  const [recentFeedback, setRecentFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [feedbackRes, coursesRes] = await Promise.all([
        axios.get("/api/feedback/my-feedback?limit=5"),
        axios.get("/api/feedback/courses"),
      ])

      const feedback = feedbackRes.data.feedback || []
      const courses = coursesRes.data.courses || []

      // Calculate stats
      const totalFeedback = feedbackRes.data.pagination?.total || 0
      const totalCourses = courses.length
      const averageRating = feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0

      setStats({
        totalFeedback,
        totalCourses,
        averageRating: Math.round(averageRating * 10) / 10,
      })
      setRecentFeedback(feedback)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-gray-600">Here's an overview of your feedback activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating > 0 ? stats.averageRating : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/feedback/submit"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Submit New Feedback</p>
                <p className="text-sm text-gray-500">Share your course experience</p>
              </div>
            </Link>

            <Link
              to="/feedback/my-feedback"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentTextIcon className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View My Feedback</p>
                <p className="text-sm text-gray-500">Manage your submissions</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Feedback</h2>
          </div>
          <div className="p-6">
            {recentFeedback.length > 0 ? (
              <div className="space-y-4">
                {recentFeedback.map((feedback) => (
                  <div key={feedback._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {feedback.course.name} ({feedback.course.code})
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Instructor: {feedback.course.instructor}</p>
                        <div className="flex items-center mt-2">
                          {renderStars(feedback.rating)}
                          <span className="ml-2 text-sm text-gray-600">{feedback.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{feedback.message}</p>
                      </div>
                      <div className="text-sm text-gray-500 ml-4">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No feedback submitted yet</p>
                <Link
                  to="/feedback/submit"
                  className="mt-2 inline-flex items-center text-primary-600 hover:text-primary-500"
                >
                  Submit your first feedback
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
