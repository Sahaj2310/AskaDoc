const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Assuming we might need User model for doctor details/validation

// Endpoint for doctors to add available slots
// This is a placeholder. A more robust solution would manage recurring availability, etc.
router.post('/doctors/me/availability', auth, async (req, res) => {
  try {
    // Only doctors can add availability
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }

    const { time } = req.body; // Assuming 'time' is sent as a valid Date string or timestamp

    if (!time) {
        return res.status(400).json({ message: 'Appointment time is required.' });
    }

    const doctorId = req.user.userId;
    const doctor = await User.findById(doctorId);

    if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found.' });
    }

    // Ensure profile.availability exists
    if (!doctor.profile.availability) {
        doctor.profile.availability = [];
    }

    const newSlotTime = new Date(time);

    // Basic check for overlapping slots (can be made more robust)
    const isOverlap = doctor.profile.availability.some(slot =>
      slot.time.getTime() === newSlotTime.getTime() // Simple exact time match check
    );

    if (isOverlap) {
        return res.status(400).json({ message: 'An availability slot already exists at this time.' });
    }

    // Add the new availability slot
    doctor.profile.availability.push({ time: newSlotTime, isBooked: false });

    await doctor.save();

    res.status(201).json({ message: 'Availability slot added successfully', slot: { time: newSlotTime, isBooked: false } });

  } catch (error) {
    console.error('Error adding availability:', error);
     if (error.name === 'CastError') { // Handle invalid date format
        return res.status(400).json({ message: 'Invalid date format provided.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Endpoint for doctors to view their available slots
router.get('/doctors/me/availability', auth, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied. Doctors only.' });
        }
        const doctorId = req.user.userId;
        const doctor = await User.findById(doctorId).select('profile.availability');

        if (!doctor) {
             return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Return sorted availability (e.g., by time)
        const sortedAvailability = doctor.profile?.availability.sort((a, b) => a.time - b.time) || [];

        res.json(sortedAvailability);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint for doctors to delete available slots
router.delete('/doctors/me/availability/:slotId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied. Doctors only.' });
        }
        const { slotId } = req.params;
        const doctorId = req.user.userId;

        const doctor = await User.findById(doctorId);

        if (!doctor) {
             return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Find the index of the slot to remove
        const slotIndex = doctor.profile?.availability.findIndex(slot => slot._id.toString() === slotId);

        if (slotIndex === -1) {
            return res.status(404).json({ message: 'Availability slot not found.' });
        }

        // Ensure the slot is not booked before deleting
        if (doctor.profile.availability[slotIndex].isBooked) {
             return res.status(400).json({ message: 'Booked slots cannot be deleted.' });
        }

        // Remove the slot from the array
        doctor.profile.availability.splice(slotIndex, 1);

        await doctor.save();

         res.json({ message: `Availability slot ${slotId} deleted successfully` });

    } catch (error) {
        console.error('Error deleting availability:', error);
         if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Slot ID' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint for patients to book an appointment
router.post('/book', auth, async (req, res) => {
    try {
      // Only patients can book appointments
      if (req.user.role !== 'patient') {
        return res.status(403).json({ message: 'Access denied. Patients only.' });
      }

      const { doctorId, time } = req.body; // 'time' should be the exact time of an available slot
      const patientId = req.user.userId;

      if (!doctorId || !time) {
        return res.status(400).json({ message: 'Doctor ID and appointment time are required.' });
      }

      const doctor = await User.findById(doctorId);

      if (!doctor || doctor.role !== 'doctor') {
           return res.status(404).json({ message: 'Doctor not found.' });
      }

      // Find the specific availability slot
      const slot = doctor.profile?.availability.find(slot => new Date(slot.time).getTime() === new Date(time).getTime());

      if (!slot) {
           return res.status(404).json({ message: 'Available slot not found at this time.' });
      }

      // Check if the slot is already booked
      if (slot.isBooked) {
           return res.status(400).json({ message: 'This slot is already booked.' });
      }

      // Create the Appointment document
      const appointment = new Appointment({
          doctor: doctorId,
          patient: patientId,
          time: new Date(time),
          status: 'scheduled'
      });

      await appointment.save();

      // Mark the slot as booked
      slot.isBooked = true;
      await doctor.save(); // Save the doctor document with the updated availability

      // Populate patient and doctor info for the response
      const savedAppointment = await Appointment.findById(appointment._id)
        .populate('doctor', 'username profile.name profile.specialization')
        .populate('patient', 'username profile.name');

      res.status(201).json({ message: 'Appointment booked successfully', appointment: savedAppointment });

    } catch (error) {
      console.error('Error booking appointment:', error);
       if (error.name === 'CastError') { // Handle invalid ID/date format
            return res.status(400).json({ message: 'Invalid doctor ID or time format provided.' });
        }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint for users (doctor/patient) to view their appointments
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;

        let query = {};
        if (userRole === 'doctor') {
            query = { doctor: userId };
        } else {
            query = { patient: userId };
        }

        // Fetch appointments, populate doctor and patient details (selectively)
        const appointments = await Appointment.find(query)
            .populate('doctor', 'username profile.name profile.specialization') // Populate doctor info
            .populate('patient', 'username profile.name') // Populate patient info
            .sort('time'); // Sort by appointment time

        res.json(appointments);

    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint for users (doctor/patient) to cancel an appointment
router.put('/:appointmentId/cancel', auth, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Ensure only participants can cancel their appointment
        if (userRole === 'doctor' && appointment.doctor.toString() !== userId) {
             return res.status(403).json({ message: 'Access denied.' });
        }
         if (userRole === 'patient' && appointment.patient.toString() !== userId) {
             return res.status(403).json({ message: 'Access denied.' });
        }

        // Only cancel if the status is scheduled
        if (appointment.status !== 'scheduled') {
            return res.status(400).json({ message: 'Appointment cannot be cancelled in its current status.' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({ message: 'Appointment cancelled', appointment });

    } catch (error) {
         console.error('Error cancelling appointment:', error);
         if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Appointment ID' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Endpoint for doctors to mark an appointment as completed
router.put('/:appointmentId/complete', auth, async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.userId;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found.' });
        }

        // Ensure only the doctor can mark as completed
        if (appointment.doctor.toString() !== userId) {
             return res.status(403).json({ message: 'Access denied.' });
        }

         // Only mark as completed if the status is scheduled
        if (appointment.status !== 'scheduled') {
            return res.status(400).json({ message: 'Appointment cannot be completed in its current status.' });
        }

        appointment.status = 'completed';
        await appointment.save();

        res.json({ message: 'Appointment marked as completed', appointment });

    } catch (error) {
         console.error('Error completing appointment:', error);
         if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Appointment ID' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


module.exports = router; 