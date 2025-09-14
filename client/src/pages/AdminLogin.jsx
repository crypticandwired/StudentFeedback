"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { adminLogin } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await adminLogin(data)
      if (result.success) {
        toast.success(result.message)
        navigate("/admin/dashboard")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Admin login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Not an admin?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Student Login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <div className="mt-1">
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Please enter a valid email",
                    },
                  })}
                  type="email"
                  className="input-field"
                  placeholder="Enter admin email"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  type="password"
                  className="input-field"
                  placeholder="Enter admin password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? "Signing in..." : "Sign in as Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
