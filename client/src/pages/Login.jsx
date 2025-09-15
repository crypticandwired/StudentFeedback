<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState } from "react";
>>>>>>> 0192c08a37f847fa60e9b6e5be0055f7ddb2a96d
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful!");
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
=======
  const { login } = useAuth();
  const navigate = useNavigate();
>>>>>>> 0192c08a37f847fa60e9b6e5be0055f7ddb2a96d

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
<<<<<<< HEAD
      await login(data);
      // Navigation is now handled by the useEffect hook above
=======
      const user = await login(data);
      if (user) {
        toast.success("Login successful!");
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
      }
>>>>>>> 0192c08a37f847fa60e9b6e5be0055f7ddb2a96d
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1">
                <input {...register("email", { required: "Email is required" })} type="email" className="input-field" placeholder="Enter your email" />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input {...register("password", { required: "Password is required" })} type="password" className="input-field" placeholder="Enter your password" />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
=======
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-center text-lg text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:text-primary/90">
              Sign up
            </Link>
          </p>
        </div>
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email Address</label>
              <div className="mt-1">
                <input {...register("email", { required: "Email is required" })} type="email" className="input-field" placeholder="you@example.com" />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
              <div className="mt-1">
                <input {...register("password", { required: "Password is required" })} type="password" className="input-field" placeholder="••••••••" />
                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
>>>>>>> 0192c08a37f847fa60e9b6e5be0055f7ddb2a96d
              </div>
            </div>
            <div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or</span>
              </div>
            </div>
            <div className="mt-6">
<<<<<<< HEAD
              <Link to="/admin-login" className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                Admin Login
=======
              <Link to="/admin-login" className="btn-secondary w-full flex justify-center">
                Continue as Admin
>>>>>>> 0192c08a37f847fa60e9b6e5be0055f7ddb2a96d
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;