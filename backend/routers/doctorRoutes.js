// Importing required modules
// Doctor is the Mongoose model representing doctor data
import express from 'express';
import Doctor from '../models/Doctor.js';

const router = express.Router();

// Description: Accepts doctor's name, specialization, and license number to register them
router.post('/', async (req, res) => {
  try {
    const { name, specialization, licenseNumber } = req.body;
    const existing = await Doctor.findOne({ licenseNumber });
    if (existing) {
      return res.status(400).json({ message: 'Doctor already registered with this license.' });
    }
    const doctor = new Doctor({ name, specialization, licenseNumber });
    await doctor.save();
    res.status(201).json({ message: 'Doctor registered successfully', doctor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Description: Retrieves and returns a list of all registered doctors
router.get('/', async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

export default router;
