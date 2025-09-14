"use client"

import { createContext, useContext, useReducer, useEffect, useState } from "react"
import axios from "axios"

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return {
        ...state,
        loading: true,
        error: null,
      }
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }
    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      }
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      }
    case "LOAD_USER":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const [isAuthLoading, setIsAuthLoading] = useState(true); // New state

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`
      localStorage.setItem("token", state.token)
    } else {
      delete axios.defaults.headers.common["Authorization"]
      localStorage.removeItem("token")
    }
  }, [state.token])

  // Load user on app start
  useEffect(() => {
    const loadUserOnMount = async () => {
      if (state.token) {
        await loadUser();
      }
      setIsAuthLoading(false); // Set loading to false after checking
    };
    loadUserOnMount();
  }, [])

  const loadUser = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      dispatch({
        type: "LOAD_USER",
        payload: response.data.user,
      })
    } catch (error) {
      console.error("Load user error:", error)
      logout()
    }
  }

  const register = async (userData) => {
    dispatch({ type: "REGISTER_START" })
    try {
      const response = await axios.post("/api/auth/register", userData)
      dispatch({
        type: "REGISTER_SUCCESS",
        payload: response.data,
      })
      return { success: true, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      dispatch({
        type: "REGISTER_FAILURE",
        payload: message,
      })
      return { success: false, message }
    }
  }

  const login = async (credentials) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const response = await axios.post("/api/auth/login", credentials)
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response.data,
      })
      return { success: true, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      dispatch({
        type: "LOGIN_FAILURE",
        payload: message,
      })
      return { success: false, message }
    }
  }

  const adminLogin = async (credentials) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const response = await axios.post("/api/auth/admin-login", credentials)
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: response.data,
      })
      return { success: true, message: response.data.message }
    } catch (error) {
      const message = error.response?.data?.message || "Admin login failed"
      dispatch({
        type: "LOGIN_FAILURE",
        payload: message,
      })
      return { success: false, message }
    }
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const updateUser = (userData) => {
    dispatch({
      type: "UPDATE_USER",
      payload: userData,
    })
  }

  const value = {
    ...state,
    isAuthLoading, // Expose new state
    register,
    login,
    adminLogin,
    logout,
    loadUser,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}