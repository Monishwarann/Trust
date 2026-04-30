const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


// Routes
const apiRoutes = require('./routes/api');
app.use('/_/backend', apiRoutes);

app.get('/_/backend/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is reachable' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
