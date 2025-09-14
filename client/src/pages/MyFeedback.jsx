"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import axios from "axios"
import toast from "react-hot-toast"
import { StarIcon, PencilIcon, TrashIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid"

const MyFeedback = () => {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [editingFeedback, setEditingFeedback] = useState(null)
  const [editForm, setEditForm] = useState({ rating: 0, message: "" })

  useEffect(() => {
    fetchFeedback(currentPage)
  }, [currentPage])

  const fetchFeedback = async (page = 1) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/feedback/my-feedback?page=${page}&limit=10`)
      setFeedback(response.data.feedback)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error("Error fetching feedback:", error)
      toast.error("Failed to load feedback")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (feedbackItem) => {
    setEditingFeedback(feedbackItem._id)
    setEditForm({
      rating: feedbackItem.rating,
      message: feedbackItem.message,
    })
  }

  const handleUpdate = async (feedbackId) => {
    try {
      const response = await axios.put(`/api/feedback/${feedbackId}`, editForm)
      if (response.data.success) {
        toast.success(response.data.message)
        setEditingFeedback(null)
        fetchFeedback(currentPage)
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update feedback"
      toast.error(message)
    }
  }

  const handleDelete = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return
    }

    try {
      const response = await axios.delete(`/api/feedback/${feedbackId}`)
      if (response.data.success) {
        toast.success(response.data.message)
        fetchFeedback(currentPage)
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete feedback"
      toast.error(message)
    }
  }

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1
      const isFilled = starNumber <= rating

      if (interactive) {
        return (
          <button key={i} type="button" onClick={() => onRatingChange(starNumber)} className="focus:outline-none">
            {isFilled ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300 hover:text-yellow-400" />
            )}
          </button>
        )
      }

      return <StarIcon key={i} className={`h-4 w-4 ${isFilled ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    })
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
              <h1 className="text-2xl font-bold text-gray-900">My Feedback</h1>
              <p className="mt-2 text-gray-600">Manage and review your course feedback submissions.</p>
            </div>
            <Link to="/feedback/submit" className="btn-primary">
              Submit New Feedback
            </Link>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow">
          {feedback.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {feedback.map((item) => (
                <div key={item._id} className="p-6">
                  {editingFeedback === item._id ? (
                    /* Edit Form */
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.course.name} ({item.course.code})
                        </h3>
                        <p className="text-sm text-gray-500">Instructor: {item.course.instructor}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex items-center space-x-1">
                          {renderStars(editForm.rating, true, (rating) => setEditForm({ ...editForm, rating }))}
                          <span className="ml-2 text-sm text-gray-600">{editForm.rating}/5</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                        <textarea
                          value={editForm.message}
                          onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                          rows={4}
                          className="input-field"
                          maxLength={1000}
                        />
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button onClick={() => setEditingFeedback(null)} className="btn-secondary">
                          Cancel
                        </button>
                        <button onClick={() => handleUpdate(item._id)} className="btn-primary">
                          Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.course.name} ({item.course.code})
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Instructor: {item.course.instructor} • Credits: {item.course.credits}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Edit feedback"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-gray-400 hover:text-red-600"
                              title="Delete feedback"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center mt-3">
                          {renderStars(item.rating)}
                          <span className="ml-2 text-sm text-gray-600">{item.rating}/5</span>
                          <span className="ml-4 text-sm text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-gray-700 mt-3">{item.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback submitted yet</h3>
              <p className="text-gray-500 mb-4">Start sharing your course experiences with other students.</p>
              <Link to="/feedback/submit" className="btn-primary">
                Submit Your First Feedback
              </Link>
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

export default MyFeedback
