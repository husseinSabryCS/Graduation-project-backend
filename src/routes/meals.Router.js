const mealscontroller= require('../controllers/meals.controller');
const router = require("express").Router();







router.route('/')
   .get(mealscontroller.usersWithoutMealToday)
   .post(mealscontroller.insertMeal)



module.exports = router;