const housingController= require('../controllers/housing.controller');
 const validation = require("../middlewares/validation");
 const Token = require('../middlewares/verifyToken');
const router = require("express").Router();
//  /api/employee


 
router.route('/')
  .post(Token.verifyToken, Token.authorize([1,2]), housingController.assignRoom);
 

  router.route('/i')
  .post( Token.verifyToken, Token.authorize([1.2]),housingController.allocateRoom);
 
  router.route('/getAcceptedStudents')
  .get( Token.verifyToken, Token.authorize([1,2]),housingController.getAcceptedStudents);

  router.route('/UsersHaveRooms')
  .get(Token.verifyToken, Token.authorize([1,2]), housingController.UsersHaveRooms);
  router.route('/getCountUserHaveRooms')
  .get( Token.verifyToken, Token.authorize([1,2]),housingController.getCountUsersWithRoomId);
  module.exports = router;