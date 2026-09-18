const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const cors = require('cors'); //  import cors
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable simple CORS 
app.use(cors());
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(" Connected to MongoDB Atlas"))
.catch(err => console.error(" MongoDB connection error:", err));

// Middleware
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/employees', employeeRoutes);

// Root route
app.get('/', (req, res) => {
  res.send(' API is running with CORS enabled.');
});

// Start Server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
