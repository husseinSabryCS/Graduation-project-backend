const conn = require("../models/dbConnectoin");
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt
const util = require('util');
const upload=require("../middlewares/uploadImages")

class adminController {
  /**
   * @description addUser
   * @route /api/admin/
   * @method get
   * @access private
   */
  static async addUser(req, res) {
    try {
      const { national_id, email, password,name,role } = req.body;

      // Check if the national ID already exists
      const checkExistingQuery = 'SELECT id FROM user WHERE national_id = ?';
      conn.query(checkExistingQuery, [national_id], async (checkErr, checkResult) => {
        if (checkErr) {
          console.error('Error checking existing user: ' + checkErr.stack);
          return res.status(500).json({ error: "An error occurred while checking existing user" });
        }

        if (checkResult.length > 0) {
          return res.status(400).json({ error: "الرقم القومي موجود بالفعل" });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Prepare the user data
        const userData = {
          national_id: national_id,
          email: email,
          password: hashedPassword,
          name:name,
          role:role
        };

        // Insert user data into the user table
        const insertUserQuery = 'INSERT INTO user SET ?';
        conn.query(insertUserQuery, userData, (err, result) => {
          if (err) {
            console.error('Error inserting user: ' + err.stack);
            return res.status(500).json({ error: "An error occurred while inserting user" });
          }

          res.status(201).json({
            message: "تمت اضافه المستخدم بنجاح.",
            userData: result,
          });
        });
      });
    } catch (error) {
      console.error('Error adding user: ' + error.stack);
      res.status(500).json({ error: "An error occurred while adding user" });
    }
  }
    /**
   * @description get Users By Role(موظفين او طلاب )
   * @route /api/admin/
   * @method get
   * @access private
   */
  static async getUsersByRole(req, res) {
    try {
      const { role } = req.params; // Assuming the role is passed as a parameter in the request
      
      // Validate the role value
      if (![0, 1,,2,3].includes(Number(role))) {
        return res.status(400).json({ error: "Invalid role value" });
      }

      // Query to fetch users based on the role
      const getUsersQuery = 'SELECT * FROM user WHERE role = ?';
      conn.query(getUsersQuery, [role], (err, result) => {
        if (err) {
          console.error('Error fetching users: ' + err.stack);
          return res.status(500).json({ error: "An error occurred while fetching users" });
        }

        res.status(200).json({
          message: "Users fetched successfully.",
          users: result,
        });
      });
    } catch (error) {
      console.error('Error fetching users: ' + error.stack);
      res.status(500).json({ error: "An error occurred while fetching users" });
    }
  }  
  static UsersHaveRooms = (req, res) => {
    // استخدام university_id من الريكوست
    const university_id = req.query.university_id;

    // استعلام لاسترجاع المستخدمين حسب room_id و role وحالة القبول ورقم الجامعة
    const selectUsersQuery = `
        SELECT u.*
        FROM user u
        LEFT JOIN admission_requests ar ON u.national_id = ar.national_id
        WHERE u.room_id IS NULL 
        AND u.role = 0 
        AND ar.status = 'مقبول'
        AND ar.university_id = ?
    `;

    conn.query(selectUsersQuery, [university_id], (err, results) => {
        if (err) {
            console.error('خطأ في استرجاع المستخدمين:', err.stack);
            return res.status(500).json({ error: "حدث خطأ أثناء استرجاع المستخدمين" });
        }

        // إذا لم يكن هناك مستخدمين، قم بإرجاع مصفوفة فارغة
        if (results.length === 0) {
            return res.status(404).json({ message: "لم يتم العثور على مستخدمين" });
        }

        // إذا كان هناك مستخدمين، قم بإرجاعهم
        res.status(200).json({ users: results });
    });
};

  static async blockUser(req, res) {
    try {
      const { national_id } = req.params; // Assuming the user ID is passed as a parameter
  
      // Check if the user exists
      const query = util.promisify(conn.query).bind(conn);
      const user = await query("SELECT * FROM user WHERE national_id = ?", [national_id]);
  
      if (user.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "User not found!" }],
        });
      }
  
      // Check if the user has admin role (role = 2)
      if (user[0].role === 2) {
        return res.status(403).json({
          errors: [{ msg: "Cannot block an admin user." }],
        });
      }
  
      // Update the blocked status in the database
      await query("UPDATE user SET blocked = true WHERE national_id = ?", [national_id]);
  
      res.status(200).json({
        message: "User has been blocked successfully.",
      });
    } catch (err) {
      console.error('Error blocking user:', err);
      res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
    }
  }
  static async unblockUser(req, res) {
    try {
        const { national_id } = req.params; // Assuming the user ID is passed as a parameter

        // Check if the user exists
        const query = util.promisify(conn.query).bind(conn);
        const user = await query("SELECT * FROM user WHERE national_id = ?", [national_id]);

        if (user.length === 0) {
            return res.status(404).json({
                errors: [{ msg: "User not found!" }],
            });
        }

        // Update the blocked status in the database
        await query("UPDATE user SET blocked = false WHERE national_id = ?", [national_id]);

        res.status(200).json({
            message: "User has been unblocked successfully.",
        });
    } catch (err) {
        console.error("Error unblocking user:", err);
        res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
    }
}

  static async updateUser(req, res) {
    try {
      const national_id  =req.params.national_id ;
      const { email, password, name } = req.body;
  
      // Check if the user exists
      const checkUserQuery = 'SELECT * FROM user WHERE national_id = ?';
      conn.query(checkUserQuery, [national_id], async (checkErr, checkResult) => {
        if (checkErr) {
          console.error('Error checking user: ' + checkErr.stack);
          return res.status(500).json({ error: "An error occurred while checking user" });
        }
  
        if (checkResult.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
  
        // Hash the password using bcrypt if provided
        let hashedPassword = checkResult[0].password; // Default to existing password
        if (password) {
          hashedPassword = await bcrypt.hash(password, saltRounds);
        }
  
        // Prepare the update data
        const updateData = {
          email: email || checkResult[0].email, // Update email if provided, otherwise keep existing value
          password: password ? hashedPassword : checkResult[0].password, // Update password if provided, otherwise keep existing value
          name: name || checkResult[0].name, // Update name if provided, otherwise keep existing value
          // Add more fields to update as needed
        };
  
        // Update user data in the user table
        const updateUserQuery = 'UPDATE user SET ? WHERE national_id = ?';
        conn.query(updateUserQuery, [updateData, national_id], (err, result) => {
          if (err) {
            console.error('Error updating user: ' + err.stack);
            return res.status(500).json({ error: "An error occurred while updating user" });
          }
  
          res.status(200).json({
            message: "User has been updated successfully.",
            updatedUserData: result,
          });
        });
      });
    } catch (error) {
      console.error('Error updating user: ' + error.stack);
      res.status(500).json({ error: "An error occurred while updating user" });
    }
  }
   
  static async blockUser(req, res) {
    try {
      const { national_id } = req.params; // Assuming the user ID is passed as a parameter
  
      // Check if the user exists
      const query = util.promisify(conn.query).bind(conn);
      const user = await query("SELECT * FROM user WHERE national_id = ?", [national_id]);
  
      if (user.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "User not found!" }],
        });
      }
  
      // Check if the user has admin role (role = 2)
      if (user[0].role === 2) {
        return res.status(403).json({
          errors: [{ msg: "Cannot block an admin user." }],
        });
      }
  
      // Update the blocked status in the database
      await query("UPDATE user SET blocked = true WHERE national_id = ?", [national_id]);
  
      res.status(200).json({
        message: "User has been blocked successfully.",
      });
    } catch (err) {
      console.error('Error blocking user:', err);
      res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
    }
  }
//==================================================================================

static addRetributionForUser = (req, res) => {
  const userId = req.body.user_id;
  const absenceDate = req.body.absence_date || new Date(); // Use current time if absence date is not provided
  const absenceType = req.body.absence_type;
  const absenceReason = req.body.absence_reason;

  if (!userId || !absenceType) {
    return res.status(400).json({ message: "يجب تقديم معرف المستخدم ونوع الغياب." });
  }

  // Function to insert penalty record for the user
  const addPenaltyRecord = (userId, absenceDate, absenceType, absenceReason, callback) => {
    const insertQuery = 'INSERT INTO user_absences (user_id, absence_date, absence_type, absence_reason) VALUES (?, ?, ?, ?)';
    conn.query(insertQuery, [userId, absenceDate, absenceType, absenceReason], (insertErr, insertResult) => {
      if (insertErr) {
        console.error('خطأ في الاستعلام: ' + insertErr.message);
        return callback(insertErr);
      }

      callback(null);
    });
  };

  // Insert penalty record for the user
  addPenaltyRecord(userId, absenceDate, absenceType, absenceReason, (addRecordErr) => {
    if (addRecordErr) {
      return res.status(500).json({ error: "حدث خطأ أثناء إضافة سجل الجزاء." });
    }

    return res.status(200).json({ message: "تمت إضافة سجل الجزاء بنجاح." });
  });
};
//=========================================================================================
static getUserRetribution = (req, res) => {
  // Function to get all penalty records with user name
  const getUserPenaltyRecords = (callback) => {
    const query = "SELECT ua.*, u.name FROM user_absences ua JOIN USER u ON ua.user_id = u.ID";
    conn.query(query, (err, result) => {
      if (err) {
        console.error("خطأ في الاستعلام: " + err.message);
        return callback(err, null);
      }

      callback(null, result);
    });
  };

  // Get penalty records for all users
  getUserPenaltyRecords((err, penaltyRecords) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "حدث خطأ أثناء البحث عن سجلات الجزاء." });
    }

    return res.status(200).json({ penalties: penaltyRecords });
  });
};
//===============================================================================================
static getUniversityDetails = (req, res) => {
  const universityName = req.params.name;

  // الحصول على معلومات الجامعة بناءً على اسم الجامعة
  const getUniversityQuery = 'SELECT * FROM universities WHERE name = ?';
  conn.query(getUniversityQuery, [universityName], (universityErr, universityResult) => {
      if (universityErr) {
          console.error('خطأ في الاستعلام: ' + universityErr.message);
          return res.status(500).json({ error: "حدث خطأ أثناء جلب معلومات الجامعة." });
      }

      if (universityResult.length === 0) {
          return res.status(404).json({ error: "الجامعة غير موجودة." });
      }

      const universityInfo = universityResult[0];
      const universityId = universityInfo.id;

      // الحصول على المباني التابعة للجامعة
      const getBuildingsQuery = 'SELECT * FROM buildings WHERE university_id = ?';
      conn.query(getBuildingsQuery, [universityId], (buildingsErr, buildingsResult) => {
          if (buildingsErr) {
              console.error('خطأ في الاستعلام: ' + buildingsErr.message);
              return res.status(500).json({ error: "حدث خطأ أثناء جلب معلومات المباني." });
          }

          // الحصول على المدن التابعة للجامعة
          const getCitiesQuery = 'SELECT * FROM cities WHERE university_id = ?';
          conn.query(getCitiesQuery, [universityId], (citiesErr, citiesResult) => {
              if (citiesErr) {
                  console.error('خطأ في الاستعلام: ' + citiesErr.message);
                  return res.status(500).json({ error: "حدث خطأ أثناء جلب معلومات المدن." });
              }

              // الحصول على الغرف التابعة للجامعة
              const getRoomsQuery = 'SELECT rooms.*, buildings.name AS building_name, cities.name AS city_name FROM rooms ' +
                  'INNER JOIN buildings ON rooms.building_id = buildings.id ' +
                  'INNER JOIN cities ON buildings.city_id = cities.id ' +
                  'WHERE buildings.university_id = ?';
              conn.query(getRoomsQuery, [universityId], (roomsErr, roomsResult) => {
                  if (roomsErr) {
                      console.error('خطأ في الاستعلام: ' + roomsErr.message);
                      return res.status(500).json({ error: "حدث خطأ أثناء جلب معلومات الغرف." });
                  }

                  // بناء الرد مع المعلومات المجمعة
                  const universityDetails = {
                      university: universityInfo,
                      buildings: buildingsResult,
                      cities: citiesResult,
                      rooms: roomsResult
                  };

                  return res.status(200).json({ message: "تم جلب معلومات الجامعة بنجاح.", data: universityDetails });
              });
          });
      });
  });
}
  
static addAppointment = (req, res) => {
  const universityName = req.body.university_name; // Updated to use university_name
  const startDate = req.body.start_date;
  const endDate = req.body.end_date;
  const category = req.body.category;

  if (!universityName || !startDate || !endDate || !category) {
      return res.status(400).json({ error: "يجب تقديم جميع البيانات المطلوبة." });
  }
  const getUniversityIdByName = (universityName, callback) => {
    const query = 'SELECT id FROM universities WHERE name = ?';
    conn.query(query, [universityName], (err, result) => {
        if (err) {
            console.error('خطأ في الاستعلام: ' + err.message);
            return callback(err, null);
        }

        if (result.length === 0) {
            return callback(null, null); // لا يوجد جامعة تحمل هذا الاسم
        }

        const universityId = result[0].id;
        return callback(null, universityId);
    });
};
  // Convert university name to university ID
   getUniversityIdByName(universityName, (err, universityId) => {
      if (err) {
          return res.status(500).json({ error: "حدث خطأ أثناء البحث عن معرف الجامعة." });
      }

      if (!universityId) {
          return res.status(404).json({ error: "الجامعة غير موجودة. يرجى إدخال اسم جامعة صحيح." });
      }

      // حذف المواعد السابقة بنفس الفئة
      const deleteAppointmentsQuery = 'DELETE FROM appointments WHERE university_id = ? AND category = ?';

      conn.query(deleteAppointmentsQuery, [universityId, category], (deleteErr, deleteResult) => {
          if (deleteErr) {
              console.error('خطأ في الاستعلام: ' + deleteErr.message);
              return res.status(500).json({ error: "حدث خطأ أثناء حذف المواعد السابقة." });
          }

          // إضافة الموعد الجديد
          const addAppointmentQuery = 'INSERT INTO appointments (university_id, start_date, end_date, category) VALUES (?, ?, ?, ?)';

          conn.query(addAppointmentQuery, [universityId, startDate, endDate, category], (addErr, addResult) => {
              if (addErr) {
                  console.error('خطأ في الاستعلام: ' + addErr.message);
                  return res.status(500).json({ error: "حدث خطأ أثناء إضافة الموعد." });
              }

              if (addResult.affectedRows === 1) {
                  return res.status(201).json({ message: "تمت إضافة الموعد بنجاح." });
              } else {
                  return res.status(500).json({ error: "لم يتم إضافة الموعد. يرجى المحاولة مرة أخرى." });
              }
          });
      });
  });
}


//======================================================================================================
static updateAppointments = (req, res) => {
  const universityName = req.body.university_name;
  const startDate = req.body.start_date;
  const endDate = req.body.end_date;
  const category = req.body.category;

  if (!universityName || !startDate || !endDate || !category) {
    return res.status(400).json({ error: "يجب تقديم جميع البيانات المطلوبة." });
  }

  const getUniversityIdByName = (universityName, callback) => {
    const query = 'SELECT id FROM universities WHERE name = ?';
    conn.query(query, [universityName], (err, result) => {
      if (err) {
        console.error('خطأ في الاستعلام: ' + err.message);
        return callback(err, null);
      }

      if (result.length === 0) {
        return callback(null, null); // لا يوجد جامعة تحمل هذا الاسم
      }

      const universityId = result[0].id;
      return callback(null, universityId);
    });
  };

  // Convert university name to university ID
  getUniversityIdByName(universityName, (err, universityId) => {
    if (err) {
      return res.status(500).json({ error: "حدث خطأ أثناء البحث عن معرف الجامعة." });
    }

    if (!universityId) {
      return res.status(404).json({ error: "الجامعة غير موجودة. يرجى إدخال اسم جامعة صحيح." });
    }

    // تعديل المواعيد الحالية بنفس الفئة
    const updateAppointmentsQuery = 'UPDATE appointments SET start_date = ?, end_date = ? WHERE university_id = ? AND category = ?';

    conn.query(updateAppointmentsQuery, [startDate, endDate, universityId, category], (updateErr, updateResult) => {
      if (updateErr) {
        console.error('خطأ في الاستعلام: ' + updateErr.message);
        return res.status(500).json({ error: "حدث خطأ أثناء تعديل المواعيد الحالية." });
      }

      if (updateResult.affectedRows > 0) {
        return res.status(200).json({ message: "تم تعديل المواعيد بنجاح." });
      } else {
        return res.status(404).json({ error: "لا توجد مواعيد لتعديلها بنفس الجامعة والفئة." });
      }
    });
  });
};
static deleteAppointmentById = (req, res) => {
  const appointmentId = req.query.id;

  if (!appointmentId) {
    return res.status(400).json({ error: "يجب تقديم معرف الموعد المطلوب للحذف." });
  }

  // حذف الموعد بناءً على معرف الموعد
  const deleteAppointmentQuery = 'DELETE FROM appointments WHERE id = ?';

  conn.query(deleteAppointmentQuery, [appointmentId], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error('خطأ في الاستعلام: ' + deleteErr.message);
      return res.status(500).json({ error: "حدث خطأ أثناء حذف الموعد." });
    }

    if (deleteResult.affectedRows > 0) {
      return res.status(200).json({ message: "تم حذف الموعد بنجاح." });
    } else {
      return res.status(404).json({ error: "الموعد غير موجود. يرجى التحقق من معرف الموعد المقدم." });
    }
  });
}


/**
* @description add Application Guidelines الارشادات  
* @route /api/student/requests
* @method GET
* @access public
*/
static addApplicationGuidelines = (req, res) => {
  const guidelines = req.body.guidelines;
  const universityName = req.query.universityName; // Updated to use university_name

  if (!guidelines || !universityName) {
      return res.status(400).json({ error: "يجب تقديم الإرشادات ومعرف الجامعة." });
  }

  const deleteAndInsertGuidelines = (universityName, guidelines, callback) => {
      const query = 'SELECT id FROM universities WHERE name = ?';
      conn.query(query, [universityName], (err, result) => {
          if (err) {
              console.error('خطأ في الاستعلام: ' + err.message);
              return callback(err);
          }

          if (result.length === 0) {
              return callback(null, { error: "الجامعة غير موجودة. يرجى إدخال اسم جامعة صحيح." });
          }

          const universityId = result[0].id;

          const deleteGuidelinesQuery = 'DELETE FROM `application guidelines and approvals` WHERE university_id = ?';
          conn.query(deleteGuidelinesQuery, [universityId], (deleteErr, deleteResult) => {
              if (deleteErr) {
                  console.error('خطأ في الاستعلام: ' + deleteErr.message);
                  return callback(deleteErr);
              }

              const insertGuidelinesQuery = 'INSERT INTO `application guidelines and approvals` (guidelines, university_id) VALUES (?, ?)';
              conn.query(insertGuidelinesQuery, [guidelines, universityId], (insertErr, insertResult) => {
                  if (insertErr) {
                      console.error('خطأ في الاستعلام: ' + insertErr.message);
                      return callback(insertErr);
                  }

                  return callback(null, { message: "تمت إضافة الإرشادات بنجاح." });
              });
          });
      });
  };

  // استخدام الفانكشن الجديدة
  deleteAndInsertGuidelines(universityName, guidelines, (err, result) => {
      if (err) {
          return res.status(500).json({ error: "حدث خطأ أثناء إضافة الإرشادات." });
      }

      if (result.error) {
          return res.status(404).json(result);
      }

      return res.status(201).json(result);
  });
}
static deleteGuidelinesById = (req, res) => {
  const guidelinesId = req.query.guidelines_id;

  if (!guidelinesId) {
      return res.status(400).json({ error: "يجب تقديم معرف الإرشادات المطلوب لحذفه." });
  }

  // استعلام SQL لحذف الإرشادات باستخدام معرفها
  const deleteGuidelinesQuery = 'DELETE FROM `application guidelines and approvals` WHERE id = ?';

  conn.query(deleteGuidelinesQuery, [guidelinesId], (deleteErr, deleteResult) => {
      if (deleteErr) {
          console.error('خطأ في الاستعلام: ' + deleteErr.message);
          return res.status(500).json({ error: "حدث خطأ أثناء حذف الإرشادات." });
      }

      if (deleteResult.affectedRows === 1) {
          return res.status(200).json({ message: "تم حذف الإرشادات بنجاح." });
      } else {
          return res.status(404).json({ error: "لم يتم العثور على الإرشادات المطلوبة لحذفها." });
      }
  });
}


//==============================================================================
static removeRetributionForUser = (req, res) => {
  const recordId = req.query.id;

  if (!recordId) {
      return res.status(400).json({ message: "يجب تقديم معرف السجل لحذف سجل الجزاء." });
  }

  // Function to remove penalty record by record id
  const removePenaltyRecord = (recordId, callback) => {
      const deleteQuery = "DELETE FROM user_absences WHERE id = ?";
      conn.query(deleteQuery, [recordId], (deleteErr, deleteResult) => {
          if (deleteErr) {
              console.error("خطأ في الاستعلام: " + deleteErr.message);
              return callback(deleteErr);
          }

          callback(null, deleteResult.affectedRows); // إرجاع عدد الصفوف المتأثرة بالحذف
      });
  };

  // Remove penalty record by record id
  removePenaltyRecord(recordId, (removeRecordErr, affectedRows) => {
      if (removeRecordErr) {
          return res.status(500).json({ error: "حدث خطأ أثناء حذف سجل الجزاء." });
      }

      if (affectedRows === 0) {
          return res.status(404).json({ message: "لا يوجد جزاء بهذا المعرف." });
      }

      return res.status(200).json({ message: "تم حذف سجل الجزاء بنجاح." });
  });
};


  
}

module.exports = adminController;
