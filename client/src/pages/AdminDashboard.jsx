"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import axios from "axios"
import { UsersIcon, AcademicCapIcon, DocumentTextIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/outline"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalFeedback: 0,
    blockedStudents: 0,
    averageRating: 0,
    ratingDistribution: [],
    recentFeedback: [],
    courseRatings: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("/api/admin/dashboard")
      setStats(response.data.stats)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of student feedback system analytics and management.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-purple-600" />
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
                <XMarkIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Blocked Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.blockedStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Rating</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "N/A"}
              </div>
              <div className="flex justify-center mb-2">
                {stats.averageRating > 0 && renderStars(Math.round(stats.averageRating))}
              </div>
              <p className="text-gray-500">Average rating across all feedback</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution.find((r) => r._id === rating)?.count || 0
                const percentage = stats.totalFeedback > 0 ? (count / stats.totalFeedback) * 100 : 0

                return (
                  <div key={rating} className="flex items-center">
                    <div className="flex items-center w-16">
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-600">{count}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Feedback and Top Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Feedback */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
            </div>
            <div className="p-6">
              {stats.recentFeedback.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentFeedback.map((feedback) => (
                    <div key={feedback._id} className="border-l-4 border-primary-500 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{feedback.student.name}</p>
                          <p className="text-sm text-gray-600">
                            {feedback.course.name} ({feedback.course.code})
                          </p>
                          <div className="flex items-center mt-1">
                            {renderStars(feedback.rating)}
                            <span className="ml-2 text-sm text-gray-600">{feedback.rating}/5</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{new Date(feedback.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No feedback available</p>
              )}
            </div>
          </div>

          {/* Top Rated Courses */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Rated Courses</h3>
            </div>
            <div className="p-6">
              {stats.courseRatings.length > 0 ? (
                <div className="space-y-4">
                  {stats.courseRatings.slice(0, 5).map((course, index) => (
                    <div key={course._id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{course.course.name}</p>
                            <p className="text-sm text-gray-600">{course.course.code}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          {renderStars(Math.round(course.averageRating))}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {course.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{course.totalFeedback} reviews</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No course ratings available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
