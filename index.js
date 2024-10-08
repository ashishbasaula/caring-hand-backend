const express = require('express');
const bodyParser = require('body-parser');
const adminRoutes = require('./routes/adminRoutes');
const formulaRoutes=require('./routes/formulParameterRoutes')
const transferRoutes = require('./routes/transferRoute');
const fileRoutes = require('./routes/fileUploadRoute');
const funeralHomeReport=require('./routes/funeralHomeReportRoute')
const calculateTransferCost=require('./routes/pricingRoute');
const pricingParameterController=require('./routes/pricingParameterRoutes')
const notification=require('./routes/notificationRoutes');
const imageTagController=require('./routes/imageTagRoute');
const path = require('path');

const { sendErrorResponse } = require('./utils/responseUtils');
require('dotenv').config()
const app = express();

// Middleware
app.use(bodyParser.json());

 
// Routes
app.use('/admin', adminRoutes);
app.use('/admin',formulaRoutes);

// this is for the funeral homes 
app.use('/funeralHome', transferRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/files', fileRoutes);

// this is for the report generation 
app.use('/report', funeralHomeReport);
app.use('/notification', notification);

app.use('/pricing',calculateTransferCost);
app.use('/costParam',pricingParameterController);
// this is for the user image tag
app.use("/imagtags",imageTagController);



app.use((req, res, next) => {
    sendErrorResponse(res, 404, 'Route not found');
  });
   
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
