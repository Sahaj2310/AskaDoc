const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log(`[Backend] Fetching profile for authenticated user: ${req.user.userId}`);
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      console.log(`[Backend] User ${req.user.userId} not found.`);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`[Backend] Profile found for user: ${user.username}`);
    res.json(user);
  } catch (error) {
    console.error('[Backend] Error fetching authenticated user profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Get user profile by ID
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, specialization, experience, fees, profile } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Basic validation for all users
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required.' });
    }

    // Additional validation for doctors
    if (user.role === 'doctor') {
      if (!specialization) {
        return res.status(400).json({ message: 'Specialization is required for doctors.' });
      }
      if (experience === undefined || experience === null || parseFloat(experience) < 0) {
        return res.status(400).json({ message: 'Valid years of experience is required for doctors.' });
      }
      if (fees === undefined || fees === null || parseFloat(fees) < 0) {
        return res.status(400).json({ message: 'Consultation fee is required for doctors.' });
      }
    }

    // Update profile fields
    if (!user.profile) {
      user.profile = {};
    }

    // Update the fields, handling both direct and nested profile structure
    user.profile.name = name;
    user.profile.email = email;
    user.profile.phone = phone;
    user.profile.address = profile?.address || req.body.address;

    if (user.role === 'doctor') {
      user.profile.specialization = specialization;
      user.profile.experience = parseFloat(experience);
      user.profile.fees = parseFloat(fees);
      user.profile.education = profile?.education || req.body.education || '';
      user.profile.languages = profile?.languages || req.body.languages || [];
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const { specialization, sortBy, minFees, maxFees, minExperience } = req.query;
    let query = { role: 'doctor' };

    if (specialization) {
      query['profile.specialization'] = specialization;
    }

    // Add filtering for fees range
    if (minFees || maxFees) {
      query['profile.fees'] = {};
      if (minFees) query['profile.fees'].$gte = parseFloat(minFees);
      if (maxFees) query['profile.fees'].$lte = parseFloat(maxFees);
    }

    // Add filtering for minimum experience
    if (minExperience) {
      query['profile.experience'] = { $gte: parseFloat(minExperience) };
    }

    let doctors = await User.find(query)
      .select('-password')
      .sort(sortBy === 'rating' ? { 'profile.rating': -1 } : { 'profile.fees': 1 });

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Get single doctor by ID
router.get('/doctors/:doctorId', async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.doctorId, role: 'doctor' }).select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    // Handle potential invalid ID format errors as well
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Doctor ID' });
    }
    res.status(500).json({ message: 'Error fetching doctor details', error: error.message });
  }
});

// Add review for doctor
router.post('/doctors/:doctorId/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctor = await User.findById(req.params.doctorId);

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Add review
    doctor.profile.reviews.push({
      patientId: req.user.userId,
      rating,
      comment
    });

    // Update average rating
    const totalRating = doctor.profile.reviews.reduce((sum, review) => sum + review.rating, 0);
    doctor.profile.rating = totalRating / doctor.profile.reviews.length;

    await doctor.save();
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// New: Endpoint for patients (or anyone) to view a specific doctor's available slots
router.get('/doctors/:doctorId/availability', async (req, res) => {
    try {
        const { doctorId } = req.params;
        console.log(`[Users Router] Attempting to fetch availability for doctor ID: ${doctorId}`);

        const doctor = await User.findById(doctorId).select('profile.availability profile.name role'); // Select role as well
        console.log('[Users Router] Result of User.findById in availability route:', doctor);

        if (!doctor || doctor.role !== 'doctor') {
            console.error(`[Users Router] Doctor not found or not a doctor for ID: ${doctorId}`);
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Return only unbooked slots
        const availableSlots = doctor.profile?.availability.filter(slot => !slot.isBooked).sort((a, b) => a.time - b.time) || [];

        res.json(availableSlots);

    } catch (error) {
         console.error('[Users Router] Error fetching doctor availability:', error);
         if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Doctor ID' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- Medical History Endpoints (Patient Only) ---

// Get patient's medical history
router.get('/profile/medical-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('profile.medicalHistory');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'patient') {
      return res.status(403).json({ message: 'Access denied. Only patients can view medical history.' });
    }
    // Ensure medicalHistory is an object, even if it's null or undefined
    const medicalHistory = user.profile?.medicalHistory || {
      conditions: [],
      allergies: [],
      prescriptions: [],
      documents: []
    };
    res.json(medicalHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical history', error: error.message });
  }
});

// Add medical condition
router.post('/profile/medical-history/conditions', auth, async (req, res) => {
  try {
    const { condition } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'patient') return res.status(403).json({ message: 'Access denied. Only patients can manage medical history.' });
    if (!condition) return res.status(400).json({ message: 'Condition is required.' });

    user.profile.medicalHistory.conditions.push(condition);
    await user.save();
    res.status(201).json({ message: 'Condition added successfully', medicalHistory: user.profile.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error adding condition', error: error.message });
  }
});

// Add allergy
router.post('/profile/medical-history/allergies', auth, async (req, res) => {
  try {
    const { allergy } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'patient') return res.status(403).json({ message: 'Access denied. Only patients can manage medical history.' });
    if (!allergy) return res.status(400).json({ message: 'Allergy is required.' });

    user.profile.medicalHistory.allergies.push(allergy);
    await user.save();
    res.status(201).json({ message: 'Allergy added successfully', medicalHistory: user.profile.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error adding allergy', error: error.message });
  }
});

// Add prescription
router.post('/profile/medical-history/prescriptions', auth, async (req, res) => {
  try {
    const { name, dosage, frequency, startDate, endDate } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'patient') return res.status(403).json({ message: 'Access denied. Only patients can manage medical history.' });
    if (!name || !dosage || !frequency) return res.status(400).json({ message: 'Name, dosage, and frequency are required for prescription.' });

    user.profile.medicalHistory.prescriptions.push({
      name,
      dosage,
      frequency,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    await user.save();
    res.status(201).json({ message: 'Prescription added successfully', medicalHistory: user.profile.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error adding prescription', error: error.message });
  }
});

// Add document (metadata only - actual file upload requires a separate service)
router.post('/profile/medical-history/documents', auth, async (req, res) => {
  try {
    const { fileName, fileUrl } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'patient') return res.status(403).json({ message: 'Access denied. Only patients can manage medical history.' });
    if (!fileName || !fileUrl) return res.status(400).json({ message: 'File name and URL are required.' });

    user.profile.medicalHistory.documents.push({
      fileName,
      fileUrl
    });
    await user.save();
    res.status(201).json({ message: 'Document metadata added successfully', medicalHistory: user.profile.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error adding document metadata', error: error.message });
  }
});

// Delete medical condition
router.delete('/profile/medical-history/conditions/:index', auth, async (req, res) => {
  try {
    const { index } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'patient') return res.status(403).json({ message: 'Access denied.' });
    if (index < 0 || index >= user.profile.medicalHistory.conditions.length) {
      return res.status(400).json({ message: 'Invalid condition index.' });
    }

    user.profile.medicalHistory.conditions.splice(index, 1);
    await user.save();
    res.status(200).json({ message: 'Condition deleted successfully', medicalHistory: user.profile.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting condition', error: error.message });
  }
});

// Delete allergy
router.delete('/profile/medical-history/allergies/:index', auth, async (req, res) => {
  try {
    const { index } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'patient') return res.status(403).json({ message: 'Access denied.' });
    if (index < 0 || index >= user.profile.medicalHistory.allergies.length) {
      return res.status(400).json({ message: 'Invalid allergy index.' });
    }

    user.profile.medicalHistory.allergies.splice(index, 1);
    await user.save();
    res.status(200).json({ message: 'Allergy deleted successfully', medicalHistory: user.profile.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting allergy', error: error.message });
  }
});

// Delete prescription
router.delete('/profile/medical-history/prescriptions/:index', auth, async (req, res) => {
  try {
    const { index } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'patient') return res.status(403).json({ message: 'Access denied.' });
    if (index < 0 || index >= user.profile.medicalHistory.prescriptions.length) {
      return res.status(400).json({ message: 'Invalid prescription index.' });
    }

    user.profile.medicalHistory.prescriptions.splice(index, 1);
    await user.save();
    res.status(200).json({ message: 'Prescription deleted successfully', medicalHistory: user.profile.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prescription', error: error.message });
  }
});

// Delete document
router.delete('/profile/medical-history/documents/:index', auth, async (req, res) => {
  try {
    const { index } = req.params;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'patient') return res.status(403).json({ message: 'Access denied.' });
    if (index < 0 || index >= user.profile.medicalHistory.documents.length) {
      return res.status(400).json({ message: 'Invalid document index.' });
    }

    user.profile.medicalHistory.documents.splice(index, 1);
    await user.save();
    res.status(200).json({ message: 'Document deleted successfully', medicalHistory: user.profile.medicalHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

// New: Endpoint for doctors to view a specific patient's medical history
router.get('/patient/:patientId/medical-history', auth, async (req, res) => {
  try {
    console.log('[users.js] Received request for patient medical history. User role:', req.user.role);
    // Ensure the requesting user is a doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Only doctors can view patient medical history.' });
    }

    const { patientId } = req.params;
    console.log('[users.js] Patient ID from params:', patientId);
    const patient = await User.findById(patientId).select('profile.medicalHistory role username profile.name'); // Include username and profile.name for patientName

    console.log('[users.js] Patient object after findById:', patient);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    // Ensure the found user is actually a patient
    if (patient.role !== 'patient') {
      console.log('[users.js] User found, but role is not patient:', patient.role);
      return res.status(400).json({ message: 'Provided ID does not belong to a patient.' });
    }

    // Ensure medicalHistory is an object, even if it's null or undefined for existing profiles
    const medicalHistory = patient.profile?.medicalHistory || {
      conditions: [],
      allergies: [],
      prescriptions: [],
      documents: []
    };

    res.json({ medicalHistory, patientName: patient.profile?.name || patient.username });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Patient ID format.' });
    }
    console.error('Error fetching patient medical history:', error);
    res.status(500).json({ message: 'Error fetching patient medical history', error: error.message });
  }
});

module.exports = router; 