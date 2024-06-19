const moment = require("moment");
const conn = require('../models/dbConnectoin');

class ReportController {
    

    static getUsersCountByDay = (req, res) => {
      // Get the day from the user's request or set it to today's date in Cairo timezone if not provided
      const day = req.query.day || moment().tz('Africa/Cairo').format('YYYY-MM-DD');
      
      // استعلام لاسترجاع المستخدمين الذين لم يتناولوا وجبة في اليوم الحالي
      const selectUsersQuery = `
        SELECT COUNT(DISTINCT user_id) AS userCount
        FROM meals
        WHERE DATE(meal_date) = ?
      `;
      
      conn.query(selectUsersQuery, [day], (err, results) => {
        if (err) {
          console.error('Error fetching users without meal today:', err.stack);
          return res.status(500).json({ error: "An error occurred while fetching users" });
        }
      
        // إذا لم يكن هناك مستخدمين، قم بإرجاع رسالة فارغة
        if (results.length === 0 || !results[0].userCount) {
          return res.status(404).json({ message: "No users found for the given day" });
        }
      
        // إذا كان هناك مستخدمين، قم بإرجاعهم
        res.status(200).json({ day, userCount: results[0].userCount });
      });
    };
    
    static getUsersCountByYear = (req, res) => {
        // Get the year from the user's request, or use the current year if not provided
        const year = req.query.year ? req.query.year : new Date().getFullYear();
    console.log(year);
        // استعلام لاسترجاع المستخدمين الذين لم يتناولوا وجبة في اليوم الحالي
        const selectUsersQuery = `
          SELECT COUNT(DISTINCT user_id) AS userCount 
          FROM meals
          WHERE YEAR(meal_date) = ?
        `;
    
        conn.query(selectUsersQuery, [year], (err, results) => {
          if (err) {
            console.error('Error fetching users without meal today:', err.stack);
            return res.status(500).json({ error: "An error occurred while fetching users" });
          }
    
          // إذا لم يكن هناك مستخدمين، قم بإرجاع رسالة فارغة
          if (results.length === 0 || !results[0].userCount) {
            return res.status(404).json({ message: "No users found for the given year" });
          }
    
          // إذا كان هناك مستخدمين، قم بإرجاعهم
          res.status(200).json({ year, userCount: results[0].userCount });
        });
      };
      static getMealsCountByYear = (req, res) => {
        // Get the year from the user's request, or use the current year if not provided
        const year = req.query.year ? req.query.year : new Date().getFullYear();
    
        // Query to retrieve the count of meals for the given year
        const selectMealsQuery = `
          SELECT COUNT(*) AS mealCount
          FROM meals
          WHERE YEAR(meal_date) = ?
        `;
    
        conn.query(selectMealsQuery, [year], (err, results) => {
          if (err) {
            console.error('Error fetching meal count:', err.stack);
            return res.status(500).json({ error: "An error occurred while fetching meal count" });
          }
    
          // If there are no meals, return an empty message
          if (results.length === 0 || !results[0].mealCount) {
            return res.status(404).json({ message: "No meals found for the given year" });
          }
    
          // If there are meals, return the count
          res.status(200).json({ year, mealCount: results[0].mealCount });
        });
      };
      static getUsersCountWithRooms = (req, res) => {
        // استخدام university_id من الريكوست
        const university_id = req.query.university_id;
    
        // استعلام لاسترجاع عدد المستخدمين حسب room_id و role وحالة القبول ورقم الجامعة
        const countUsersQuery = `
            SELECT COUNT(*) AS usersCount
            FROM user u
            LEFT JOIN admission_requests ar ON u.national_id = ar.national_id
            WHERE u.room_id IS NOT NULL 
            AND u.role = 0 
            AND ar.status = 'مقبول'
            AND ar.university_id = ?
        `;
    
        conn.query(countUsersQuery, [university_id], (err, results) => {
            if (err) {
                console.error('خطأ في استرجاع عدد المستخدمين:', err.stack);
                return res.status(500).json({ error: "حدث خطأ أثناء استرجاع عدد المستخدمين" });
            }
    
            // إذا لم يكن هناك مستخدمين، قم بإرجاع 0
            if (results.length === 0 || !results[0].usersCount) {
                return res.status(404).json({ message: "لم يتم العثور على مستخدمين" });
            }
    
            // إذا كان هناك مستخدمين، قم بإرجاع عددهم
            res.status(200).json({ usersCount: results[0].usersCount });
        });
    };
    static getCountNewUsers = (req, res) => {
      
      const year = req.query.year ? req.query.year : new Date().getFullYear();
      
      const countUsersQuery = `
      SELECT COUNT(*) AS NumberOfApplcatoins
      FROM admission_requests
      WHERE student_type='جديد' or student_type='مستجد' and YEAR(date) = ?
      `;
  
      conn.query(countUsersQuery, [year], (err, results) => {
          if (err) {
              console.error('خطأ في استرجاع عدد المستخدمين:', err.stack);
              return res.status(500).json({ error: "حدث خطأ أثناء استرجاع عدد المستخدمين" });
          }
  
          // إذا لم يكن هناك مستخدمين، قم بإرجاع 0
          if (results.length === 0 || !results[0].NumberOfApplcatoins) {
              return res.status(404).json({ message: "لم يتم العثور على مستخدمين" });
          }
  
          // إذا كان هناك مستخدمين، قم بإرجاع عددهم
          res.status(200).json({ NumberOfApplcatoins: results[0].NumberOfApplcatoins });
      });
  };
  static getCountOldUsers = (req, res) => {
      
    const year = req.query.year ? req.query.year : new Date().getFullYear();
    console.log(year);
    // استعلام لاسترجاع عدد المستخدمين حسب room_id و role وحالة القبول ورقم الجامعة
    const countUsersQuery = `
    SELECT COUNT(*) AS NumberOfApplcatoins
    FROM admission_requests
    WHERE student_type='قديم' and YEAR(date) = ?
    `;

    conn.query(countUsersQuery, [year], (err, results) => {
        if (err) {
            console.error('خطأ في استرجاع عدد المستخدمين:', err.stack);
            return res.status(500).json({ error: "حدث خطأ أثناء استرجاع عدد المستخدمين" });
        }

        // إذا لم يكن هناك مستخدمين، قم بإرجاع 0
        if (results.length === 0 || !results[0].NumberOfApplcatoins) {
            return res.status(404).json({ message: "لم يتم العثور على مستخدمين" });
        }

        // إذا كان هناك مستخدمين، قم بإرجاع عددهم
        res.status(200).json({ NumberOfApplcatoins: results[0].NumberOfApplcatoins });
    });
};
static getNumberOfAblibleRooms = (req, res) => {
      
 
  const countUsersQuery = `
  SELECT COUNT(*) AS availbleRooms
  FROM rooms
  WHERE status=1 
  `;

  conn.query(countUsersQuery,  (err, results) => {
      if (err) {
          console.error('خطأ في استرجاع عدد المستخدمين:', err.stack);
          return res.status(500).json({ error: "حدث خطأ أثناء استرجاع عدد الغرف" });
      }

      // إذا لم يكن هناك غرف قم بإرجاع 0
      if (results.length === 0 || !results[0].availbleRooms) {
          return res.status(404).json({ message: "لم يتم العثور على غرف متاحة" });
      }

      // إذا كان هناك غرف قم بإرجاع عددهم
      res.status(200).json({ availbleRooms: results[0].availbleRooms });
  });
};
static getNumberOfUnablibleRooms = (req, res) => {
      
 
  const countUsersQuery = `
  SELECT COUNT(*) AS availbleRooms
  FROM rooms
  WHERE status=0
  `;

  conn.query(countUsersQuery,  (err, results) => {
      if (err) {
          console.error('خطأ في استرجاع عدد المستخدمين:', err.stack);
          return res.status(500).json({ error: "حدث خطأ أثناء استرجاع عدد الغرف" });
      }

      // إذا لم يكن هناك غرف قم بإرجاع 0
      if (results.length === 0 || !results[0].availbleRooms) {
          return res.status(404).json({ message: "لم يتم العثور على غرف غير متاحة" });
      }

      // إذا كان هناك غرف قم بإرجاع عددهم
      res.status(200).json({ availbleRooms: results[0].availbleRooms });
  });
};
}

module.exports = ReportController;
