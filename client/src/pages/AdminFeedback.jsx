"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import axios from "axios"
import toast from "react-hot-toast"
import { DocumentTextIcon, StarIcon, FunnelIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline"

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    course: "",
    student: "",
    rating: "",
    startDate: "",
    endDate: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchFeedback(currentPage)
  }, [currentPage])

  const fetchInitialData = async () => {
    try {
      const [coursesRes, studentsRes] = await Promise.all([
        axios.get("/api/admin/courses"),
        axios.get("/api/admin/students?limit=100"),
      ])
      setCourses(coursesRes.data.courses)
      setStudents(studentsRes.data.students)
      fetchFeedback(1)
    } catch (error) {
      console.error("Error fetching initial data:", error)
      toast.error("Failed to load data")
    }
  }

  const fetchFeedback = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await axios.get(`/api/admin/feedback?${params}`)
      setFeedback(response.data.feedback)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Error fetching feedback:", error)
      toast.error("Failed to load feedback")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  const applyFilters = () => {
    setCurrentPage(1)
    fetchFeedback(1)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      course: "",
      student: "",
      rating: "",
      startDate: "",
      endDate: "",
    })
    setCurrentPage(1)
    fetchFeedback(1)
    setShowFilters(false)
  }

  const exportFeedback = async () => {
    try {
      setExporting(true)
      const params = new URLSearchParams()

      // Add filters to export params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await axios.get(`/api/admin/feedback/export?${params}`, {
        responseType: "blob",
      })

      // Create download link
      const blob = new Blob([response.data], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `feedback-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Feedback data exported successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export feedback data")
    } finally {
      setExporting(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  if (loading && feedback.length === 0) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
              <p className="mt-2 text-gray-600">View, filter, and export all student feedback submissions.</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center ${hasActiveFilters ? "bg-primary-50 text-primary-700" : ""}`}
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters {hasActiveFilters && `(${Object.values(filters).filter(Boolean).length})`}
              </button>
              <button onClick={exportFeedback} disabled={exporting} className="btn-primary flex items-center">
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange("course", e.target.value)}
                  className="input-field"
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={filters.student}
                  onChange={(e) => handleFilterChange("student", e.target.value)}
                  className="input-field"
                >
                  <option value="">All Students</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange("rating", e.target.value)}
                  className="input-field"
                >
                  <option value="">All Ratings</option>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} Star{rating !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button onClick={clearFilters} className="btn-secondary">
                Clear All
              </button>
              <button onClick={applyFilters} className="btn-primary">
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow">
          {feedback.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {feedback.map((item) => (
                <div key={item._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {item.course.name} ({item.course.code})
                          </h3>
                          <p className="text-sm text-gray-600">Instructor: {item.course.instructor}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            {renderStars(item.rating)}
                            <span className="ml-2 text-sm font-medium text-gray-900">{item.rating}/5</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Student:</span> {item.student.name} ({item.student.email})
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span> {item.student.phone}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{item.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-500">
                {hasActiveFilters ? "Try adjusting your filters." : "No feedback has been submitted yet."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {pagination.current} of {pagination.pages} ({pagination.total} total)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminFeedback
