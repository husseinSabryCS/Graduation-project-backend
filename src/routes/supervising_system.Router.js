const validation = require("../middlewares/validation");
const Token = require('../middlewares/verifyToken');
const Supervising_systemController= require('../controllers/supervising_system.controller');
const router = require("express").Router();
//=========================================\\


router.route('/building/male')
   .get(Token.verifyToken, Token.authorize([2]),Supervising_systemController.getMaleBuildings) 
router.route('/building/female')
   .get(Token.verifyToken, Token.authorize([2]),Supervising_systemController.getFemaleBuildings) 
router.route('/building')
   .post(Token.verifyToken, Token.authorize([2]),Supervising_systemController.addBuilding) 
router.route('/room')
   .post(Token.verifyToken, Token.authorize([2]),Supervising_systemController.addRoom) 
   .get(Token.verifyToken, Token.authorize([2]),Supervising_systemController.getRoomsInBuilding) 
   router.route('/rooms')
   .get(Token.verifyToken, Token.authorize([2]),Supervising_systemController.getRoomById) 
   .put(Token.verifyToken, Token.authorize([2]),Supervising_systemController.updateRoomById) 
   
   



//=========================================\\
module.exports = router;