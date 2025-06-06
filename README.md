# AskaDoc

An online platform connecting patients with a wide range of expert doctors for efficient and accessible medical consultations.

## Features

* User authentication with JWT
* Role-based access (Doctor and Patient)
* Real-time chat functionality
* Doctor search by specialty
* Profile management
* Secure password handling with bcrypt

## Tech Stack

**Frontend:**
- React.js
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