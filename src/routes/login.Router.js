const loginController= require('../controllers/login.controller')
 const validation = require("../middlewares/validation");
const validateUser=require("../middlewares/validateUser")
const router = require("express").Router();
//  /api/login




router.route('/')
   .post(loginController.login)
module.exports = router;