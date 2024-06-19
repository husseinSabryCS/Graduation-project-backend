const express = require('express');
const HousingFeeController = require('../controllers/HousingFee.controller');
const Token = require('../middlewares/verifyToken');
const router = express.Router();




// Routes for Housing Fees
router.route('/')
       .post(HousingFeeController.createHousingFee)
       .get(HousingFeeController.getAllHousingFees)
       .put(HousingFeeController.updateHousingFee)
       .delete(HousingFeeController.deleteHousingFee);

module.exports = router;
