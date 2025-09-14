"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import axios from "axios"
import toast from "react-hot-toast"
import {
  MagnifyingGlassIcon,
  UserIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline"

const AdminStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchStudents(currentPage, searchTerm)
  }, [currentPage])

  const fetchStudents = async (page = 1, search = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (search) params.append("search", search)

      const response = await axios.get(`/api/admin/students?${params}`)
      setStudents(response.data.students)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchStudents(1, searchTerm)
  }

  const handleBlockToggle = async (studentId, currentStatus) => {
    setActionLoading({ ...actionLoading, [studentId]: true })
    try {
      const response = await axios.put(`/api/admin/students/${studentId}/block`)
      if (response.data.success) {
        toast.success(response.data.message)
        fetchStudents(currentPage, searchTerm)
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update student status"
      toast.error(message)
    } finally {
      setActionLoading({ ...actionLoading, [studentId]: false })
    }
  }

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This will also delete all their feedback.`)) {
      return
    }

    setActionLoading({ ...actionLoading, [studentId]: true })
    try {
      const response = await axios.delete(`/api/admin/students/${studentId}`)
      if (response.data.success) {
        toast.success(response.data.message)
        fetchStudents(currentPage, searchTerm)
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete student"
      toast.error(message)
    } finally {
      setActionLoading({ ...actionLoading, [studentId]: false })
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
              <p className="mt-2 text-gray-600">Manage student accounts and monitor their activity.</p>
            </div>
            <div className="text-sm text-gray-500">Total: {pagination.total} students</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("")
                  setCurrentPage(1)
                  fetchStudents(1, "")
                }}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.profilePicture ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={student.profilePicture || "/placeholder.svg"}
                              alt={student.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.phone}</div>
                      <div className="text-sm text-gray-500">{new Date(student.dateOfBirth).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{student.feedbackCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {student.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleBlockToggle(student._id, student.isBlocked)}
                          disabled={actionLoading[student._id]}
                          className={`p-2 rounded-md ${
                            student.isBlocked
                              ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                              : "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50"
                          }`}
                          title={student.isBlocked ? "Unblock student" : "Block student"}
                        >
                          {student.isBlocked ? (
                            <LockOpenIcon className="h-5 w-5" />
                          ) : (
                            <LockClosedIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(student._id, student.name)}
                          disabled={actionLoading[student._id]}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                          title="Delete student"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500">
                {searchTerm ? "Try adjusting your search criteria." : "No students have registered yet."}
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

export default AdminStudents
