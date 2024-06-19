const BasicDataController = require('../controllers/BasicData.controller');
const chatController= require('../controllers/BasicData.controller');
const Token = require('../middlewares/verifyToken');
const router = require("express").Router();
//  /api/BasicData

router.route('/')
       .get(Token.verifyToken, Token.authorize([1,2]),BasicDataController.getStudentDataByNationalId)
router.route('/male')
       .get(Token.verifyToken, Token.authorize([1,2]),BasicDataController.getFemaleStudents)
router.route('/female')
       .get(Token.verifyToken, Token.authorize([1,2]),BasicDataController.getMaleStudents)
       
  module.exports = router;