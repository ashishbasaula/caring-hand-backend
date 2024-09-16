const express = require('express');
const router = express.Router();
const formulaParameterController=require('../controller/formulaParameterController');
 
const authenticateToken = require('../middleware/authMiddleware');

// Routes with authentication
router.post('/formula-parameters', authenticateToken, formulaParameterController.createFormulaParameter);
router.get('/formula-parameters', authenticateToken, formulaParameterController.getAllFormulaParameters);
router.get('/formula-parameters', authenticateToken, formulaParameterController.getFormulaParameterById);
router.patch('/formula-parameters', authenticateToken, formulaParameterController.updateFormulaParameter);
router.delete('/formula-parameters', authenticateToken, formulaParameterController.deleteFormulaParameter);

module.exports = router;
