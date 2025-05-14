import { io } from 'socket.io-client';

/**
 * Socket Manager for handling real-time connections to different socket endpoints
 */
class SocketManager {
  constructor() {
    this.sockets = {};
    // Use import.meta.env instead of process.env for Vite
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  /**
   * Connect to a specific socket namespace
   *
   * @param {string} namespace - The socket namespace to connect to
   * @param {object} options - Connection options
   * @param {function} onConnect - Callback for successful connection
   * @param {function} onDisconnect - Callback for disconnection
   * @returns {object} The socket instance
   */
  connect(namespace = 'general', options = {}, onConnect = null, onDisconnect = null) {
    if (this.sockets[namespace]) {
      console.log(`Socket for ${namespace} already exists, returning existing instance`);
      return this.sockets[namespace];
    }

    console.log(`Connecting to socket namespace: ${namespace}`);
    
    // Get token from localStorage if available
    let token;
    try {
      token = localStorage.getItem('token') || null;
    } catch (error) {
      console.error('Error accessing localStorage for token');
      token = null;
    }

    // Set up connection options
    const socketOptions = {
      ...options,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      autoConnect: true,
      auth: token ? { token } : undefined
    };

    // Connect to the socket namespace
    const socketNamespace = namespace !== 'general' ? `/${namespace}` : '';
    const socket = io(`${this.baseURL}${socketNamespace}`, socketOptions);

    // Set up event handlers
    socket.on('connect', () => {
      console.log(`Socket connected: ${namespace}`);
      this.reconnectAttempts = 0;
      if (onConnect) onConnect(socket);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${namespace}, reason: ${reason}`);
      if (onDisconnect) onDisconnect(reason);
    });

    socket.on('connect_error', (error) => {
      console.error(`Socket connection error: ${namespace}`, error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error(`Max reconnect attempts reached for ${namespace}, stopping reconnection`);
        socket.disconnect();
      }
    });

    this.sockets[namespace] = socket;
    return socket;
  }

  // Rest of the class remains unchanged
}

// Create a singleton instance
const socketManager = new SocketManager();

export default socketManager;