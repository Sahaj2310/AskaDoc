# AskaDoc

An online platform connecting patients with a wide range of expert doctors for efficient and accessible medical consultations.

## Features

* User authentication with JWT
* Role-based access (Doctor and Patient)
* **Robust Profile Management:**
    * Doctors can manage specialization, experience, consultation fees, education, and languages.
    * Patients and doctors can update their personal and contact information.
* **Enhanced Appointment System:**
    * Patients can view and cancel their booked appointments.
    * Doctors can manage their availability slots.
* **Improved Chat Functionality:**
    * Real-time chat (initial setup, ready for Socket.IO integration).
    * Doctors can view and chat with their patients.
* Doctor search by specialty
* Secure password handling with bcrypt

## UI/UX Status (Ongoing)

* The application is built with React.js and Material-UI, with an ongoing effort to implement a calm, muted, and approachable design using card-based layouts, subtle animations, and clean forms. Initial global theme adjustments have been applied.

## Tech Stack

**Frontend:**
- React.js
- Material-UI
- CSS
- Socket.IO Client

**Backend:**
- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication
- bcryptjs

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the server directory:
```bash
cd server
npm install
```

2. Create a .env file with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. Start the server:
```bash
npm start
```

### Frontend Setup
1. Navigate to the client directory:
```bash
cd client
npm install
```

2. Create a .env file with:
```
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

## Author

* Sahaj Modi

## License

This project is licensed under the MIT License. 