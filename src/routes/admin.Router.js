const adminController= require('../controllers/admin.controller');
 const validation = require("../middlewares/validation");
 const upload = require("../middlewares/uploadImages");
 const Token = require('../middlewares/verifyToken');
const Admin = require('../validations/admin.validation');
const router = require("express").Router();

//  /api/admin



router.route('/')
   .post(Token.verifyToken, Token.authorize([1,2]),adminController.addUser)
   .get(Token.verifyToken, Token.authorize([2]),adminController.UsersHaveRooms)
router.route('/update/:national_id')
   .put(Token.verifyToken, Token.authorize([2]),adminController.updateUser)
router.route(Token.verifyToken, Token.authorize([2]),'/block/:national_id')
   .put(Token.verifyToken, Token.authorize([2]),adminController.blockUser)
router.route('/retribution')
   .post(Token.verifyToken, Token.authorize([2,1]),adminController.addRetributionForUser)
   .get(Token.verifyToken, Token.authorize([2,1]),adminController.getUserRetribution) 
   .delete(Token.verifyToken, Token.authorize([2,1]),adminController.removeRetributionForUser)
router.route('/addAppointment')
.post(Token.verifyToken, Token.authorize([2]),adminController.addAppointment) 
.delete(Token.verifyToken, Token.authorize([2]),adminController.deleteAppointmentById) 
router.route('/guidelines')
.post( Token.verifyToken, Token.authorize([2]),adminController.addApplicationGuidelines)
.delete( Token.verifyToken, Token.authorize([2]),adminController.deleteGuidelinesById); 
router.route('/info/:name')
   .get(Token.verifyToken, Token.authorize([2]),adminController.getUniversityDetails) 
router.route('/get/:role')
   .get(Token.verifyToken, Token.authorize([2]),adminController.getUsersByRole)
router.route('/Appointment')
   .post(Token.verifyToken, Token.authorize([2]),adminController.addAppointment)
   .put(Token.verifyToken, Token.authorize([2]),adminController.updateAppointments)
   .delete(Token.verifyToken, Token.authorize([2]),adminController.deleteAppointmentById)
   router.route('/unblock/:national_id')
   .put(Token.verifyToken, Token.authorize([2]),adminController.unblockUser)
   router.route('/block/:national_id')
   .put(Token.verifyToken, Token.authorize([2]),adminController.blockUser)
module.exports = router;