const conn = require('../models/dbConnectoin'); // استيراد اتصال قاعدة البيانات
const moment = require('moment');
class mealsController  {

  /**
   * @description Get Users Who Haven't Had a Meal Today
   * @route /api/users/without_meal_today
   * @method get
   * @access private
   */
  static usersWithoutMealToday = (req, res) => {
    // استعلام لاسترجاع المستخدمين الذين لم يتناولوا وجبة في اليوم الحالي ولكن قيمة dormTypeWithoutFood تساوي 1
    const selectUsersQuery = `
      SELECT u.*
      FROM user u
      LEFT JOIN admission_requests ar ON u.national_id = ar.national_id
      WHERE u.id NOT IN (
        SELECT DISTINCT user_id
        FROM meals
        WHERE DATE(meal_date) = CURDATE()
      )
      AND u.role = 0
      AND u.blocked = 0
      AND u.room_id IS NOT NULL
      AND ar.dormTypeWithoutFood = 1;
    `;

    conn.query(selectUsersQuery, (err, results) => {
      if (err) {
        console.error('Error fetching users without meal today:', err.stack);
        return res.status(500).json({ error: "An error occurred while fetching users" });
      }

      // إذا لم يكن هناك مستخدمين، قم بإرجاع رسالة فارغة
      if (results.length === 0) {
        return res.status(404).json({ message: "No users without meal today" });
      }

      // إذا كان هناك مستخدمين، قم بإرجاعهم
      res.status(200).json({ users: results });
    });
}
  
    /**
     * @description Insert Meal Data for a User
     * @route /api/meals/insert_meal
     * @method post
     * @access private
     */
 

static insertMeal = (req, res) => {
  // استخراج معرف المستخدم من الطلب
  const { user_id } = req.body;

  // التحقق من أن معرف المستخدم موجود
  if (!user_id) {
    return res.status(400).json({ error: "User ID is a required field" });
  }

  // الحصول على تاريخ اليوم الحالي بصيغة YYYY-MM-DD باستخدام moment.js
  const meal_date = moment().format('YYYY-MM-DD');

  // فحص ما إذا كان المستخدم قد استلم وجبته في نفس اليوم
  const checkMealQuery = 'SELECT * FROM meals WHERE user_id = ? AND meal_date = ?';
  conn.query(checkMealQuery, [user_id, meal_date], (err, result) => {
    if (err) {
      console.error('Error checking meal:', err.stack);
      return res.status(500).json({ error: "An error occurred while checking meal" });
    }

    // إذا كان المستخدم قد استلم وجبته بالفعل، يتم إرسال رسالة بذلك
    if (result.length > 0) {
      return res.status(400).json({ error: "User has already received a meal today" });
    }

    // استعلام لإدراج بيانات الوجبة في جدول الوجبات
    const insertMealQuery = 'INSERT INTO meals (user_id, meal_date) VALUES (?, ?)';
    conn.query(insertMealQuery, [user_id, meal_date], (err, result) => {
      if (err) {
        console.error('Error inserting meal:', err.stack);
        return res.status(500).json({ error: "An error occurred while inserting meal" });
      }

      // إرسال رسالة نجاح إذا تم إدراج بيانات الوجبة بنجاح
      res.status(201).json({ message: "Meal inserted successfully" });
    });
  });
}
}


module.exports = mealsController;
