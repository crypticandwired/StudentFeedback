import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      dateOfBirth: user ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      address: user?.address,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.put("/api/users/profile", data);
      if (response.data.success) {
        toast.success("Profile updated successfully!");
        updateUser(response.data.user); // Update user in context
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input {...register("name", { required: "Name is required" })} className="input-field" />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input {...register("phone", { required: "Phone is required" })} className="input-field" />
               {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input {...register("dateOfBirth", { required: "Date of Birth is required" })} type="date" className="input-field" />
              {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea {...register("address", { required: "Address is required" })} className="input-field" />
              {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>}
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {user?.name}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Phone:</span> {user?.phone}</p>
            <p><span className="font-medium">Date of Birth:</span> {user ? new Date(user.dateOfBirth).toLocaleDateString() : ''}</p>
            <p><span className="font-medium">Address:</span> {user?.address}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;