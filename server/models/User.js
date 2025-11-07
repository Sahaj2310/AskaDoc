const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SPECIALIZATIONS = [
  'Cardiology',
  'Dermatology',
  'Dentistry',
  'Endocrinology',
  'ENT',
  'Family Medicine',
  'Gastroenterology',
  'General Medicine',
  'General Practitioner',
  'Gynecology',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Urology'
];

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true
  },
  profile: {
    name: String,
    email: String,
    phone: String,
    address: String,
    specialization: {
      type: String,
      enum: SPECIALIZATIONS,
      required: false // Not required during registration, can be added later in profile
    },
    experience: Number,
    fees: Number,
    education: String,
    languages: [String],
    rating: {
      type: Number,
      default: 0
    },
    reviews: [{
      patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: Number,
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    availability: [
      {
        time: {
          type: Date,
          required: true
        },
        isBooked: {
          type: Boolean,
          default: false
        }
      }
    ],
    medicalHistory: {
      conditions: [{
        type: String,
        trim: true
      }],
      allergies: [{
        type: String,
        trim: true
      }],
      prescriptions: [
        {
          name: {
            type: String,
            trim: true
          },
          dosage: {
            type: String,
            trim: true
          },
          frequency: {
            type: String,
            trim: true
          },
          startDate: Date,
          endDate: Date
        }
      ],
      documents: [
        {
          fileName: {
            type: String,
            trim: true
          },
          fileUrl: {
            type: String,
            trim: true
          },
          uploadDate: {
            type: Date,
            default: Date.now
          }
        }
      ]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 