// Import the main App component from the client-side React application
export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Student Feedback System</h1>
          <p className="text-lg text-gray-600 mb-8">
            A comprehensive MERN stack application for collecting and managing student feedback
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
            <div className="text-left space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">For Students:</h3>
                <ul className="list-disc list-inside text-gray-600 ml-4">
                  <li>Register for an account</li>
                  <li>Submit feedback for courses</li>
                  <li>View and manage your feedback submissions</li>
                  <li>Update your profile information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">For Administrators:</h3>
                <ul className="list-disc list-inside text-gray-600 ml-4">
                  <li>View comprehensive analytics dashboard</li>
                  <li>Manage student accounts</li>
                  <li>Create and manage courses</li>
                  <li>Export feedback data to CSV</li>
                  <li>Monitor system performance and trends</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                To run this application, start both the backend server (Node.js/Express) and frontend client
                (React/Vite) as described in the README.md file.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Backend Features</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• JWT Authentication</li>
                <li>• MongoDB with Mongoose</li>
                <li>• Input Validation</li>
                <li>• File Upload Support</li>
                <li>• CSV Export</li>
                <li>• Role-based Access Control</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Frontend Features</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• React with Vite</li>
                <li>• Tailwind CSS Styling</li>
                <li>• Responsive Design</li>
                <li>• Interactive Charts</li>
                <li>• Form Validation</li>
                <li>• Real-time Updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
