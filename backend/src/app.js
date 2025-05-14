const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB } = require('./config/database');
const socketManager = require('./socket/socketManager');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = socketManager.init(server);
app.set('io', io); // Make io available for controllers

// Middleware
// Allow CORS for all origins
app.use(cors({
  origin: 'http://localhost:5173', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json());

// Mount routes
app.use(routes);

// Root route
app.get('/', (req, res) => {
  res.send('Drone Survey Management API is running');
});

// Error handling middleware
app.use(errorHandler);

module.exports = server;