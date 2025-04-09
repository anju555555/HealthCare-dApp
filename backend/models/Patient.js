import mongoose from 'mongoose';

// Define the schema for a Patient
const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  district: String,
  symptomsDetails: String,
  bloodGroup: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
