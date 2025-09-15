import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const user = await adminLogin(data);
      if (user) {
        toast.success("Admin login successful!");
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Admin Portal</h1>
          <p className="mt-2 text-center text-lg text-muted-foreground">
            Not an admin?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary/90">
              Go to Student Login
            </Link>
          </p>
        </div>
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Admin Email</label>
              <div className="mt-1">
                <input
                  {...register("email", { required: "Email is required" })}
                  type="email"
                  className="input-field"
                  placeholder="admin@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
              <div className="mt-1">
                <input
                  {...register("password", { required: "Password is required" })}
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>}
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
  );
};

export default AdminLogin;