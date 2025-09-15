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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Create Your Account</h1>
                <p className="mt-2 text-center text-lg text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-primary hover:text-primary/90">
                        Sign in
                    </Link>
                </p>
            </div>
            <div className="card">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Full Name</label>
                        <input {...register("name", { required: "Name is required" })} type="text" className="input-field" />
                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Email Address</label>
                        <input {...register("email", { required: "Email is required" })} type="email" className="input-field" />
                        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Password</label>
                        <input {...register("password", { required: "Password is required" })} type="password" className="input-field" />
                        {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Phone Number</label>
                        <input {...register("phone", { required: "Phone number is required" })} type="tel" className="input-field" />
                        {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <input {...register("dateOfBirth", { required: "Date of birth is required" })} type="date" className="input-field" />
                        {errors.dateOfBirth && <p className="mt-1 text-sm text-destructive">{errors.dateOfBirth.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground">Address</label>
                        <textarea {...register("address", { required: "Address is required" })} rows={3} className="input-field" />
                        {errors.address && <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>}
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