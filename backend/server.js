// Import required modules
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import patientRoutes from './routers/patientRoutes.js';
import doctorRoutes from './routers/doctorRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);


// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Health check route
app.get("/ping", (req, res) => {
    res.send("Backend is working! ✅");
  });
 