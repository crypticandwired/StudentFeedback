import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Registration successful!");
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      // Navigation is now handled by the useEffect hook
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
            </Link>
            </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="mt-1">
                            <input {...register("name", { required: "Name is required" })} type="text" className="input-field" placeholder="Enter your full name" />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                        </div>
                    </div>
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
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1">
                            <input {...register("phone", { required: "Phone number is required" })} type="tel" className="input-field" placeholder="Enter your phone number" />
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <div className="mt-1">
                            <input {...register("dateOfBirth", { required: "Date of birth is required" })} type="date" className="input-field" />
                            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <div className="mt-1">
                            <textarea {...register("address", { required: "Address is required" })} rows={3} className="input-field" placeholder="Enter your address" />
                            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={isLoading} className="btn-primary w-full">
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default Register;