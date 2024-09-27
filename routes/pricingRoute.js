const express=require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { calculateTransferCost } = require('../controller/pricingController');
const router=express.Router();


router.post("/calculate_cost",authenticateToken,calculateTransferCost);
module.exports=router;