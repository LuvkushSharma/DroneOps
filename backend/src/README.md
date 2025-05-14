# Drone Survey Management System - Backend

This is the backend API for the Drone Survey Management System, providing endpoints for drone fleet management, mission planning, survey execution, and reporting.

## Technology Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time updates
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/drone-survey
   JWT_SECRET=your_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

### Running the Server

- Development mode:
  ```
  npm run dev
  ```
- Production mode:
  ```
  npm start
  ```

### Seeding the Database

To populate the database with initial testing data:
```
npm run seed
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Drones
- `GET /api/drones` - Get all drones
- `GET /api/drones/:id` - Get a specific drone
- `POST /api/drones` - Create a new drone
- `PUT /api/drones/:id` - Update a drone
- `DELETE /api/drones/:id` - Delete a drone
- `PATCH /api/drones/:id/status` - Update drone status

### Missions
- `GET /api/missions` - Get all missions
- `GET /api/missions/:id` - Get a specific mission
- `POST /api/missions` - Create a new mission
- `PUT /api/missions/:id` - Update a mission
- `DELETE /api/missions/:id` - Delete a mission
- `POST /api/missions/:id/start` - Start a mission
- `POST /api/missions/:id/pause` - Pause a mission
- `POST /api/missions/:id/abort` - Abort a mission
- `POST /api/missions/:id/complete` - Complete a mission
- `PATCH /api/missions/:id/progress` - Update mission progress

### Surveys
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/:id` - Get a specific survey
- `POST /api/surveys` - Create a new survey
- `PUT /api/surveys/:id` - Update a survey
- `DELETE /api/surveys/:id` - Delete a survey
- `POST /api/surveys/:id/missions` - Add mission to survey
- `DELETE /api/surveys/:id/missions` - Remove mission from survey
- `GET /api/surveys/:id/statistics` - Get survey statistics

## Socket.io Events

- `droneUpdate` - Emitted when drone data is updated
- `droneStatusUpdate` - Emitted when drone status changes
- `missionStart` - Emitted when a mission starts
- `missionPause` - Emitted when a mission is paused
- `missionAbort` - Emitted when a mission is aborted
- `missionComplete` - Emitted when a mission is completed
- `missionProgressUpdate` - Emitted when mission progress updates