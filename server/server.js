const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = process.env.MONGODB_URI;

// MongoDB Connection
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define the Schema
const dataSchema = new mongoose.Schema({
  end_year: { type: (Date || Number)},
  intensity: Number,
  likelihood: Number,
  relevance: Number,
  start_year: { type: Date },
  country: String,
  topic: String,
  region: String,
  city: String,
  pestle: String,
  source: String,
  swot: String,
});

// Create Mongoose Model with explicit collection name
const Data = mongoose.model('Data', dataSchema, 'data');

// Route: Fetch all data
app.get('/api/data', async (req, res) => {
  console.log('Received request for /api/data');
  try {
    const data = await Data.find();
    // console.log('Fetched data:', data.length > 0 ? data : 'No data found');
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: error.message });
  }
});




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
