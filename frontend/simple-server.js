const express = require('express');
const path = require('path');
const app = express();
const PORT = 3003;

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, 'build')));

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 React app running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and navigate to the app`);
});
