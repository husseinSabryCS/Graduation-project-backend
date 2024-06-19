const studentController = require("../controllers/student.controller");
const validation = require("../middlewares/validation");
const Token = require('../middlewares/verifyToken'); 
const StudentValidator = require("../validations/student.validation");
const router = require("express").Router();

//  /api/student
router
  .route("/new")
  .post(
    validation(StudentValidator.insertAdmissionRequest),
    studentController.insertNewAdmissionRequest
  );
  router
  .route("/old")
  .post(
    validation(StudentValidator.insertAdmissionRequest),
    studentController.insertOldAdmissionRequest
  );
//تقديم طلب التحاق
//تقديم طلب التحاق
router
  .route("/guidelines")
  .get(studentController.getApplicationGuidelinesByName); // عرض ارشادات جامعه ب الاسم

  router.route("/")
  .get(studentController.checkAdmissionStatusByNationalId); //الاستعلام عن القبول بالرقم القومي

router
  .route("/GetAppointment")
  .get(studentController.getAppointmentsByUniversityName); //الاستعلام عن مواعيد التقديم لكل جامعه ب اسمها
router.route("/edit")
.put( Token.verifyToken, Token.authorize([0]),studentController.updateAdmissionRequestFields); 
//تعديل البيانات
router.route("/Absence")
.get(Token.verifyToken, Token.authorize([0]),studentController.getUserAbsences); 
router.route("/getAdmissionHousingFee")
.get(studentController.getStudentAdmissionDetails); 
router.route("/get/:national_id")
.get(studentController.getUserByNationalId); 
router.route("/getStudentData")
.get(Token.verifyToken, Token.authorize([0]),studentController.getAdmissionRequestByNationalID); 
module.exports = router;
