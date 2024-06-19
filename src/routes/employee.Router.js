const employeeController= require('../controllers/employee.controller');
 const validation = require("../middlewares/validation");
 const Token = require('../middlewares/verifyToken');
 const employee = require('../validations/employee.validation');
const router = require("express").Router();
//  /api/employee

router.route('/')
  .post(Token.verifyToken, Token.authorize([1,2]),employeeController.acceptAdmissionRequest)
router.route('/reject')
  .post(Token.verifyToken, Token.authorize([1,2]),employeeController.rejectAdmissionRequest)
router.route('/')
  .get(Token.verifyToken, Token.authorize([1,2]), employeeController.getAllAdmissionRequests);
  router.route('/block/:national_id')
  .put(Token.verifyToken, Token.authorize([1,2]),employeeController.blockStudent)
  





  module.exports = router;