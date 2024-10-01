const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseUtils');
const { executeQuery } = require('../models/db'); // Assuming executeQuery is defined for handling DB queries

// Function to calculate price for the transfer based on parameters
exports.calculateTransferCost = async (req, res) => {
  const { serviceType, mileage, isHeavyBody, decomposition, leakingFluids, bodyOver250lbs } = req.body;

  // Validate required parameters
  if (!serviceType || mileage === undefined) {
    return sendErrorResponse(res, 400, 'Missing required parameters');
  }

  try {
    // Step 1: Fetch pricing parameters for the specified service type
    const pricingResults = await executeQuery('SELECT * FROM pricing_parameters WHERE service_type = ?', [serviceType]);

    if (pricingResults.length === 0) {
      return sendErrorResponse(res, 404, 'Service type not found');
    }

    const pricing = pricingResults[0];

    // Step 2: Initialize base cost and extra costs (ensure they are numbers)
    let baseCost = parseFloat(pricing.base_rate) || 0;  // Ensure baseCost is a number
    let extraCosts = 0;

    // Step 3: Mileage cost (only apply if mileage is over 10 miles)
    if (mileage > 10) {
      const additionalMiles = mileage - 10;
      extraCosts += additionalMiles * (parseFloat(pricing.mileage_rate) || 0);
    }

    // Step 4: Apply special case charges based on the request (ensure they are numbers)
    if (isHeavyBody) {
      extraCosts += parseFloat(pricing.heavy_body_charge) || 0;
    }

    if (decomposition) {
      extraCosts += parseFloat(pricing.decomposition_charge) || 0;
    }

    if (leakingFluids) {
      extraCosts += parseFloat(pricing.leaking_fluids_charge) || 0;
    }

    if (bodyOver250lbs) {
      extraCosts += parseFloat(pricing.body_over_250lbs_charge) || 0;
    }

    // Step 5: Calculate total cost as a number
    const totalCost = baseCost + extraCosts;

    // Return the calculated cost, formatted to two decimal places
    sendSuccessResponse(res, 200, { cost: totalCost.toFixed(2) }, 'Cost calculated successfully');
  } catch (err) {
    // Handle database or other server errors
    return sendErrorResponse(res, 500, 'Server error', err.message);
  }
};
