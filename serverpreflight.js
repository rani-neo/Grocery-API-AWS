const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');



 //  import cors
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(" Connected to MongoDB Atlas"))
.catch(err => console.error(" MongoDB connection error:", err));

// Middleware
app.use(express.json());


// Define CORS options to allow 'https://google.com.au', 'https://google.com', and 'http://127.0.0.1:5500/'
const corsOptions = {
  origin: (origin, callback) => {
    if (
      origin === 'https://google.com.au' ||
      origin === 'https://google.com' ||
      origin === 'http://127.0.0.1:5500'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};


// Correct CORS middleware per route
app.use('/api/products', cors(corsOptions), productRoutes);
app.use('/api/employees', cors(corsOptions), employeeRoutes);
app.use('/api/orders', cors(corsOptions), orderRoutes);
app.use('/api/auth', cors(corsOptions), authRoutes);



/// Preflight OPTIONS handling (only needed once per route group)
app.options('/api/products', cors(corsOptions));
app.options('/api/orders', cors(corsOptions));
app.options('/api/employees', cors(corsOptions));
// Preflight handling for /api/auth
app.options('/api/auth/login', cors(corsOptions));

// Preflight for POST, PUT, DELETE
app.options('api//products', (req, res) => {
  // Set appropriate CORS headers for '/products' route
  res.header('Access-Control-Allow-Origin', '*'); // Allow any origin (change as needed)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // Specify allowed methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Specify allowed headers

  // Respond to the preflight request
  res.sendStatus(200);
});

/*app.options('/api/orders', (req, res) => {
  // Set appropriate CORS headers for '/orders' route
  res.header('Access-Control-Allow-Origin', '*'); // Allow any origin (change as needed)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // Specify allowed methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Specify allowed headers

  // Respond to the preflight request
  res.sendStatus(200);
});


app.options('api//employees', (req, res) => {
  // Set appropriate CORS headers for '/employees' route
  res.header('Access-Control-Allow-Origin', '*'); // Allow any origin (change as needed)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE'); // Specify allowed methods
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Specify allowed headers

  // Respond to the preflight request
  res.sendStatus(200);
});
app.options('/api/auth/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});*/

// Start Server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
