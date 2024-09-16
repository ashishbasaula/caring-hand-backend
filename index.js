const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const formulaRoutes=require('./routes/formulParameterRoutes')
const { sendErrorResponse } = require('./utils/responseUtils');
require('dotenv').config()
const app = express();

// Middleware
app.use(bodyParser.json());

 
// Routes
app.use('/admin', adminRoutes);
app.use('/admin',formulaRoutes)

app.use((req, res, next) => {
    sendErrorResponse(res, 404, 'Route not found');
  });
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
