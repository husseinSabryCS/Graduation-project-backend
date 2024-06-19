
const ReportsController= require('../controllers/Reports.controller');
const Token = require('../middlewares/verifyToken');
const router = require("express").Router();
//  /api/BasicData

router.route('/Day')
       .get(ReportsController.getUsersCountByDay)//عدد المستخدمين اللي حصلوا علي وجبات خلال يوم 
router.route('/Year')
       .get(ReportsController.getUsersCountByYear)// عدد المستخدمين اللي حصلوا علي وجبات خلال سنه 
       router.route('/mealsofyear')
       .get(ReportsController.getMealsCountByYear)// عدد الوجبات اللي اتوزعت في السنه 
       router.route('/studentNunber')
       .get(ReportsController.getUsersCountWithRooms)//عدد الطلاب اللي ساكنه في جامعه معينه 
       router.route('/appReqestNew')
       .get(ReportsController.getCountNewUsers)//عدد طلبات الالتحاق ل الطلاب الجديده
       router.route('/appReqestOld')
       .get(ReportsController.getCountOldUsers)//عدد طلبات الالتحاق ل الطلاب القديمه.
       router.route('/NumberOfAvailbleRooms')
       .get(ReportsController.getNumberOfAblibleRooms)//عدد الغرف المتحاجه ل التسكين 
       router.route('/NumberOfUnavailbleRooms')
       .get(ReportsController.getNumberOfUnablibleRooms)// عدد الغرف الكامله (الغيرمتاحه)
module.exports = router;
