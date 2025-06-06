const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
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
    const { name, email, phone, specialization, experience, fees } = req.body;
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

    user.profile.name = name;
    user.profile.email = email;
    user.profile.phone = phone;

    if (user.role === 'doctor') {
      user.profile.specialization = specialization;
      user.profile.experience = parseFloat(experience);
      user.profile.fees = parseFloat(fees);
    }

    await user.save();
    res.json(user);
  } catch (error) {
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

module.exports = router; 