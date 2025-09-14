import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: user?.name,
            phone: user?.phone,
            dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            address: user?.address,
        },
    });

    useEffect(() => {
        // Reset form with user data when user object is available
        if (user) {
            reset({
                name: user.name,
                phone: user.phone,
                dateOfBirth: new Date(user.dateOfBirth).toISOString().split('T')[0],
                address: user.address,
            });
        }
    }, [user, reset]);


    // Form for changing password
    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors },
        reset: resetPasswordForm,
    } = useForm();

    const onProfileSubmit = async (data) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("phone", data.phone);
        formData.append("dateOfBirth", data.dateOfBirth);
        formData.append("address", data.address);
        if (profilePicture) {
            formData.append("profilePicture", profilePicture);
        }

        try {
            const response = await axios.put("/api/users/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.success) {
                toast.success("Profile updated successfully!");
                updateUser(response.data.user);
                setIsEditing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    };

    const onPasswordSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await axios.put("/api/users/change-password", data);
            if (response.data.success) {
                toast.success("Password changed successfully!");
                resetPasswordForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
                {/* Profile Details Section */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="btn-secondary">
                            Edit Profile
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4 border-b pb-6 mb-6">
                        {/* Profile Picture Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfilePicture(e.target.files[0])}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                        </div>
                        {/* Other Profile Fields */}
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
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? "Saving..." : "Save Changes"}</button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-2 border-b pb-6 mb-6">
                        <img src={user?.profilePicture || '/placeholder-user.jpg'} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
                        <p><span className="font-medium">Name:</span> {user?.name}</p>
                        <p><span className="font-medium">Email:</span> {user?.email}</p>
                        <p><span className="font-medium">Phone:</span> {user?.phone}</p>
                        <p><span className="font-medium">Date of Birth:</span> {user ? new Date(user.dateOfBirth).toLocaleDateString() : ''}</p>
                        <p><span className="font-medium">Address:</span> {user?.address}</p>
                    </div>
                )}

                {/* Change Password Section */}
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
                    <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                {...registerPassword("currentPassword", { required: "Current password is required" })}
                                className="input-field"
                            />
                            {passwordErrors.currentPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                {...registerPassword("newPassword", {
                                    required: "New password is required",
                                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                        message: "Password must contain uppercase, lowercase, number, and special character",
                                    },
                                })}
                                className="input-field"
                            />
                            {passwordErrors.newPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword.message}</p>}
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? "Updating..." : "Update Password"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;