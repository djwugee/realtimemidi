/* server.js */

/**
 * Express Server Configuration
 * This file sets up an Express server to serve static files and handle routes for the Real-time MIDI Guitar application.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize Express app
const app = express();

// Determine the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the port for the server
const PORT = process.env.PORT || 3000;

// Middleware to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
