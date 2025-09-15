const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// --- START OF CHANGES ---

// 1. Define specific CORS options for production
const corsOptions = {
  // Replace this with the actual URL of your deployed frontend
  origin: 'https://your-frontend-project-name.vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// 2. Use the cors middleware with the options
app.use(cors(corsOptions));

// --- END OF CHANGES ---


// Middleware
// We removed the old app.use(cors()) and replaced it with the configured one above
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/admin", require("./routes/admin"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 3. Add this line to export the app for Vercel
module.exports = app;