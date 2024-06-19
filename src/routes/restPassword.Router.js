const restPasswordController= require('../controllers/restPassword.controller');
const router = require("express").Router();



// Route for sending password by email

router.route('/sendCodetoEmail')  
   .post(restPasswordController.sendPasswordByEmail)
router.route('/')
.post(restPasswordController.resetPassword);


module.exports = router;
