"use client"

import { useState, useEffect } from "react"
import Layout from "../components/Layout"
import axios from "axios"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  StarIcon,
  DocumentTextIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  const {
    register, handleSubmit, formState: { errors }, reset, setValue,
  } = useForm()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/admin/courses")
      setCourses(response.data.courses)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = () => {
    setEditingCourse(null)
    reset()
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setEditingCourse(course)
    setValue("name", course.name)
    setValue("code", course.code)
    setValue("description", course.description)
    setValue("instructor", course.instructor)
    setValue("credits", course.credits)
    setValue("isActive", course.isActive)
    setShowModal(true)
  }

  const onSubmit = async (data) => {
    try {
      let response
      if (editingCourse) {
        response = await axios.put(`/api/admin/courses/${editingCourse._id}`, data)
      } else {
        response = await axios.post("/api/admin/courses", data)
      }

      if (response.data.success) {
        toast.success(response.data.message)
        setShowModal(false)
        reset()
        fetchCourses()
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save course"
      toast.error(message)
    }
  }

  const handleDelete = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      return
    }

    setActionLoading({ ...actionLoading, [courseId]: true })
    try {
      const response = await axios.delete(`/api/admin/courses/${courseId}`)
      if (response.data.success) {
        toast.success(response.data.message)
        fetchCourses()
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete course"
      toast.error(message)
    } finally {
      setActionLoading({ ...actionLoading, [courseId]: false })
    }
  }

  const handleToggleActive = async (courseId, currentStatus) => {
    setActionLoading({ ...actionLoading, [courseId]: true })
    try {
      const response = await axios.put(`/api/admin/courses/${courseId}`, {
        isActive: !currentStatus,
      })
      if (response.data.success) {
        toast.success(response.data.message)
        fetchCourses()
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update course status"
      toast.error(message)
    } finally {
      setActionLoading({ ...actionLoading, [courseId]: false })
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
              <p className="mt-2 text-gray-600">Manage courses and monitor feedback statistics.</p>
            </div>
            <button onClick={handleCreateCourse} className="btn-primary flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Course
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${course.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                    >
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Instructor:</span> {course.instructor}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Credits:</span> {course.credits}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">{course.description}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{course.totalFeedback} reviews</span>
                  </div>
                  {course.averageRating > 0 && (
                    <div className="flex items-center">
                      {renderStars(Math.round(course.averageRating))}
                      <span className="ml-2 text-sm font-medium text-gray-900">{course.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(course._id, course.isActive)}
                    disabled={actionLoading[course._id]}
                    className={`text-sm px-3 py-1 rounded-md ${course.isActive
                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        : "text-green-600 hover:text-green-900 hover:bg-green-50"}`}
                  >
                    {course.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      title="Edit course"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course._id, course.name)}
                      disabled={actionLoading[course._id] || course.totalFeedback > 0}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      title={course.totalFeedback > 0 ? "Cannot delete course with feedback" : "Delete course"}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first course.</p>
            <button onClick={handleCreateCourse} className="btn-primary">
              Add Course
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                  <input
                    {...register("name", {
                      required: "Course name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                      maxLength: { value: 100, message: "Name cannot exceed 100 characters" },
                    })}
                    className="input-field"
                    placeholder="Enter course name" />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                  <input
                    {...register("code", {
                      required: "Course code is required",
                      minLength: { value: 2, message: "Code must be at least 2 characters" },
                      maxLength: { value: 10, message: "Code cannot exceed 10 characters" },
                    })}
                    className="input-field"
                    placeholder="e.g., CS101"
                    style={{ textTransform: "uppercase" }} />
                  {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                  <input
                    {...register("instructor", {
                      required: "Instructor name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                      maxLength: { value: 50, message: "Name cannot exceed 50 characters" },
                    })}
                    className="input-field"
                    placeholder="Enter instructor name" />
                  {errors.instructor && <p className="mt-1 text-sm text-red-600">{errors.instructor.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <select
                    {...register("credits", {
                      required: "Credits are required",
                      valueAsNumber: true,
                    })}
                    className="input-field"
                  >
                    <option value="">Select credits</option>
                    {[1, 2, 3, 4, 5, 6].map((credit) => (
                      <option key={credit} value={credit}>
                        {credit}
                      </option>
                    ))}
                  </select>
                  {errors.credits && <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register("description", {
                      required: "Description is required",
                      minLength: { value: 10, message: "Description must be at least 10 characters" },
                      maxLength: { value: 500, message: "Description cannot exceed 500 characters" },
                    })}
                    rows={3}
                    className="input-field"
                    placeholder="Enter course description" />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                {editingCourse && (
                  <div className="flex items-center">
                    <input
                      {...register("isActive")}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    <label className="ml-2 block text-sm text-gray-900">Active</label>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCourse ? "Update Course" : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminCourses
