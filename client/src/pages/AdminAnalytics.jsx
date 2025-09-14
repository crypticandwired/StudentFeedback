"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import axios from "axios"
import { ChartBarIcon, ArrowTrendingUpIcon, AcademicCapIcon, UsersIcon, StarIcon } from "@heroicons/react/24/outline"

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    monthlyTrends: [],
    coursePerformance: [],
    studentEngagement: [],
    ratingTrends: [],
    instructorPerformance: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get("/api/admin/analytics")
      setAnalytics(response.data.analytics)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const getMonthName = (monthNumber) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[monthNumber - 1]
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Trends</h1>
          <p className="mt-2 text-gray-600">Detailed insights into feedback patterns and system performance.</p>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ArrowTrendingUpIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Monthly Feedback Trends</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-max">
              {analytics.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex-shrink-0 bg-gray-50 rounded-lg p-4 min-w-[120px]">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      {getMonthName(trend._id.month)} {trend._id.year}
                    </p>
                    <p className="text-2xl font-bold text-primary-600 mt-1">{trend.totalFeedback}</p>
                    <p className="text-xs text-gray-500">submissions</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">{trend.averageRating.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">avg rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Performance and Student Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Courses */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Top Performing Courses</h2>
            </div>
            <div className="space-y-4">
              {analytics.coursePerformance.slice(0, 5).map((course, index) => (
                <div key={course._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      <span className="ml-2 text-sm font-medium text-gray-900">{course.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{course.totalFeedback} reviews</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Active Students */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <UsersIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Most Active Students</h2>
            </div>
            <div className="space-y-4">
              {analytics.studentEngagement.slice(0, 5).map((student, index) => (
                <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{student.student.name}</p>
                      <p className="text-sm text-gray-600">{student.student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{student.totalFeedback}</p>
                    <p className="text-sm text-gray-500">submissions</p>
                    <p className="text-xs text-gray-500">Avg: {student.averageRating.toFixed(1)} ⭐</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instructor Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Instructor Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.instructorPerformance.map((instructor, index) => (
                  <tr key={instructor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{instructor._id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {instructor.courses.slice(0, 2).join(", ")}
                        {instructor.courses.length > 2 && ` +${instructor.courses.length - 2} more`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{instructor.totalFeedback}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(Math.round(instructor.averageRating))}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {instructor.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rating Distribution Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <StarIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Rating Trends Over Time</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-max">
              {analytics.ratingTrends.map((trend, index) => (
                <div key={index} className="flex-shrink-0 bg-gray-50 rounded-lg p-4 min-w-[140px]">
                  <div className="text-center mb-3">
                    <p className="text-sm font-medium text-gray-600">
                      {getMonthName(trend._id.month)} {trend._id.year}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const ratingData = trend.ratings.find((r) => r.rating === rating)
                      const count = ratingData ? ratingData.count : 0
                      const total = trend.ratings.reduce((sum, r) => sum + r.count, 0)
                      const percentage = total > 0 ? (count / total) * 100 : 0

                      return (
                        <div key={rating} className="flex items-center text-xs">
                          <span className="w-3">{rating}</span>
                          <StarIcon className="h-3 w-3 text-yellow-400 fill-current mx-1" />
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 mx-1">
                            <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                          </div>
                          <span className="w-6 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminAnalytics
