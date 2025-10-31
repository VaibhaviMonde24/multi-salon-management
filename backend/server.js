// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json());
// MySQL connection
require('./db'); // just require, no need to export from server.js
// Test Route
app.get('/', (req, res) => {
  res.send('Multi-Salon Management System Backend is running ');
});
// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/salons', require('./routes/salonRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/owner', require('./routes/ownerRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/review', require('./routes/reviewRoutes'));
//app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/working-hours', require('./routes/workingHoursRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
