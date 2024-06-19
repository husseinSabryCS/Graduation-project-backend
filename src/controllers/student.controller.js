const conn = require("../models/dbConnectoin");
const bcrypt = require("bcrypt");
const moment = require('moment');
class studentController {
 

  static insertNewAdmissionRequest = async (req, res) => {
    try {
        const defaultStatus = "لم يتم مراجعة الطلب";
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const StudentType = "جديد";

        // Get university_id using the sent university_name
        const getUniversityIdQuery = "SELECT id FROM universities WHERE name = ?";
        conn.query(getUniversityIdQuery, [req.body.university_name], (uniErr, uniResult) => {
            if (uniErr) {
                console.error("Error getting university ID: " + uniErr.stack);
                return res.status(500).json({ error: "An error occurred while getting university ID" });
            }

            if (uniResult.length === 0) {
                return res.status(400).json({ error: "University with this name does not exist" });
            }

            const university_id = uniResult[0].id;

            // Check if registration is open for the student's category and gender at this university
            const today = moment().format('YYYY-MM-DD');
            console.log("Today's date:", today);
            console.log("Gender:", req.body.gender);
            let checkRegistrationQuery;
            if (req.body.gender === 'ذكر') {
                checkRegistrationQuery = `
                    SELECT * FROM appointments 
                    WHERE category = 'الطلاب الجدد' 
                    AND university_id = ? 
                    AND ? BETWEEN start_date AND end_date
                `;
            } if (req.body.gender === 'انثي') {
                checkRegistrationQuery = `
                    SELECT * FROM appointments 
                    WHERE category = 'الطالبات الجدد' 
                    AND university_id = ? 
                    AND ? BETWEEN start_date AND end_date
                `;
            }

            conn.query(checkRegistrationQuery, [university_id, today], (regErr, regResult) => {
                if (regErr) {
                    console.error("Error checking registration availability: " + regErr.stack);
                    return res.status(500).json({ error: "An error occurred while checking registration availability" });
                }

                console.log("Registration check result:", regResult);

                if (regResult.length === 0) {
                    return res.status(400).json({ error: "Registration is not available currently" });
                }

                // Check if the national ID already exists
                const checkExistingQuery = "SELECT id FROM admission_requests WHERE national_id = ?";
                conn.query(checkExistingQuery, [req.body.national_id], (checkErr, checkResult) => {
                    if (checkErr) {
                        console.error("Error checking existing admission request: " + checkErr.stack);
                        return res.status(500).json({ error: "An error occurred while checking existing admission request" });
                    }

                    if (checkResult.length > 0) {
                        return res.status(400).json({ error: "Admission request with this national ID already exists" });
                    }

                    // Determine the category and distance based on the residence address
                    const getCategoryAndDistanceQuery = "SELECT Category_ID, Distance FROM countries WHERE Country_Name = ?";
                    conn.query(getCategoryAndDistanceQuery, [req.body.residence_address], (categoryErr, categoryResult) => {
                        if (categoryErr) {
                            console.error("Error getting category and distance: " + categoryErr.stack);
                            return res.status(500).json({ error: "An error occurred while getting category and distance" });
                        }

                        let categoryID, distance;
                        if (categoryResult.length > 0) {
                            categoryID = categoryResult[0].Category_ID;
                            distance = categoryResult[0].Distance;
                        }

                        // Data to insert
                        const dataToInsert = {
                            university_id: university_id,
                            Student_type: StudentType,
                            student_id: req.body.student_id,
                            nationality: req.body.nationality,
                            national_id: req.body.national_id,
                            name: req.body.name,
                            date_of_birth: req.body.date_of_birth,
                            place_of_birth: req.body.place_of_birth,
                            gender: req.body.gender,
                            religion: req.body.religion,
                            residence_address: req.body.residence_address,
                            detailed_address: req.body.detailed_address,
                            email: req.body.email,
                            mobile_number: req.body.mobile_number,
                            father_name: req.body.father_name,
                            father_national_id: req.body.father_national_id,
                            father_occupation: req.body.father_occupation,
                            father_phone_number: req.body.father_phone_number,
                            guardian_name: req.body.guardian_name,
                            guardian_national_id: req.body.guardian_national_id,
                            guardian_phone_number: req.body.guardian_phone_number,
                            parents_status: req.body.parents_status,
                            college: req.body.college,
                            level: req.body.level,
                            previous_academic_year_gpa: req.body.previous_academic_year_gpa,
                            status: defaultStatus,
                            password: hashedPassword,
                            Housing_in_previous_years: req.body.Housing_in_previous_years,
                            housing_type: req.body.housing_type,
                            family_abroad: req.body.family_abroad,
                            special_needs: req.body.special_needs,
                            Secondary_Division: req.body.Secondary_Division,
                            Total_grades_high_school: req.body.Total_grades_high_school,
                            Passport_number: req.body.Passport_number,
                            Passport_issuing_authority: req.body.Passport_issuing_authority,
                            distance: distance,
                            category: categoryID,
                            university_name: req.body.university_name,
                        };

                        const insertQuery = "INSERT INTO admission_requests SET ?";
                        conn.query(insertQuery, dataToInsert, (err, result) => {
                            if (err) {
                                console.error("Error inserting admission request: " + err.stack);
                                return res.status(500).json({ error: "An error occurred while inserting admission request" });
                            }

                            // If the request is inserted successfully, add the user to the "user" table
                            const userToInsert = {
                                name: req.body.name,
                                email: req.body.email,
                                national_id: req.body.national_id,
                                role: 0,
                                password: hashedPassword,
                            };

                            const insertUserQuery = "INSERT INTO user SET ?";
                            conn.query(insertUserQuery, userToInsert, (userErr, userResult) => {
                                if (userErr) {
                                    console.error("Error inserting user: " + userErr.stack);
                                    return res.status(500).json({ error: "An error occurred while inserting user" });
                                }
                                return res.status(201).json({ message: "Admission request and user created successfully" });
                            });
                        });
                    });
                });
            });
        });
    } catch (err) {
        console.error("Unexpected error: " + err.stack);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};


  /**
   * @description تقديم طلب التحاق
   * @route /api/student/
   * @method POST
   * @access public
   */

 



  static insertOldAdmissionRequest = async (req, res) => {
    try {
        const defaultStatus = "لم يتم مراجعة الطلب";
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const StudentType = "قديم";

        // Get university_id using the sent university_name
        const getUniversityIdQuery = "SELECT id FROM universities WHERE name = ?";
        conn.query(getUniversityIdQuery, [req.body.university_name], (uniErr, uniResult) => {
            if (uniErr) {
                console.error("Error getting university ID: " + uniErr.stack);
                return res.status(500).json({ error: "An error occurred while getting university ID" });
            }

            if (uniResult.length === 0) {
                return res.status(400).json({ error: "University with this name does not exist" });
            }

            const university_id = uniResult[0].id;

            // Check if registration is open for the student's category and gender at this university
            const today = moment().format('YYYY-MM-DD');
            console.log(today);
            console.log(req.body.gender);

            let checkRegistrationQuery;
            if (req.body.gender === 'ذكر') {
                checkRegistrationQuery = `
                    SELECT * FROM appointments 
                    WHERE category = 'الطلاب القدامي' 
                    AND university_id = ? 
                    AND ? BETWEEN start_date AND end_date
                `;
            } 
            if (req.body.gender === 'انثي') {
              checkRegistrationQuery = `
                  SELECT * FROM appointments 
                  WHERE category = 'الطلاب القدامي' 
                  AND university_id = ? 
                  AND ? BETWEEN start_date AND end_date
              `;
          } 
            conn.query(checkRegistrationQuery, [university_id, today], (regErr, regResult) => {
                if (regErr) {
                    console.error("Error checking registration availability: " + regErr.stack);
                    return res.status(500).json({ error: "An error occurred while checking registration availability" });
                }

                if (regResult.length === 0) {
                    return res.status(400).json({ error: "Registration is not available currently" });
                }

                // Check if the national ID already exists
                const checkExistingQuery = "SELECT id FROM admission_requests WHERE national_id = ?";
                conn.query(checkExistingQuery, [req.body.national_id], (checkErr, checkResult) => {
                    if (checkErr) {
                        console.error("Error checking existing admission request: " + checkErr.stack);
                        return res.status(500).json({ error: "An error occurred while checking existing admission request" });
                    }

                    if (checkResult.length > 0) {
                        return res.status(400).json({ err: "Admission request with this national ID already exists" });
                    }

                    // Determine the category and distance based on the residence address
                    const getCategoryAndDistanceQuery = "SELECT Category_ID, Distance FROM countries WHERE Country_Name = ?";
                    conn.query(getCategoryAndDistanceQuery, [req.body.residence_address], (categoryErr, categoryResult) => {
                        if (categoryErr) {
                            console.error("Error getting category and distance: " + categoryErr.stack);
                            return res.status(500).json({ error: "An error occurred while getting category and distance" });
                        }

                        let categoryID, distance;
                        if (categoryResult.length > 0) {
                            categoryID = categoryResult[0].Category_ID;
                            distance = categoryResult[0].Distance;
                        }

                        // Data to insert
                        const dataToInsert = {
                            university_id: university_id,
                            Student_type: StudentType,
                            student_id: req.body.student_id,
                            nationality: req.body.nationality,
                            national_id: req.body.national_id,
                            name: req.body.name,
                            date_of_birth: req.body.date_of_birth,
                            place_of_birth: req.body.place_of_birth,
                            gender: req.body.gender,
                            religion: req.body.religion,
                            residence_address: req.body.residence_address,
                            detailed_address: req.body.detailed_address,
                            email: req.body.email,
                            mobile_number: req.body.mobile_number,
                            father_name: req.body.father_name,
                            father_national_id: req.body.father_national_id,
                            father_occupation: req.body.father_occupation,
                            father_phone_number: req.body.father_phone_number,
                            guardian_name: req.body.guardian_name,
                            guardian_national_id: req.body.guardian_national_id,
                            guardian_phone_number: req.body.guardian_phone_number,
                            parents_status: req.body.parents_status,
                            college: req.body.college,
                            level: req.body.level,
                            previous_academic_year_gpa: req.body.previous_academic_year_gpa,
                            status: defaultStatus,
                            password: hashedPassword,
                            Housing_in_previous_years: req.body.Housing_in_previous_years,
                            housing_type: req.body.housing_type,
                            family_abroad: req.body.family_abroad,
                            special_needs: req.body.special_needs,
                            Secondary_Division: req.body.Secondary_Division,
                            Total_grades_high_school: req.body.Total_grades_high_school,
                            Passport_number: req.body.Passport_number,
                            Passport_issuing_authority: req.body.Passport_issuing_authority,
                            distance: distance,
                            category: categoryID,
                            university_name: req.body.university_name,
                        };

                        const insertQuery = "INSERT INTO admission_requests SET ?";
                        conn.query(insertQuery, dataToInsert, (err, result) => {
                            if (err) {
                                console.error("Error inserting admission request: " + err.stack);
                                return res.status(500).json({ error: "An error occurred while inserting admission request" });
                            }

                            // If the request is inserted successfully, add the user to the "user" table
                            const userToInsert = {
                                name: req.body.name,
                                email: req.body.email,
                                national_id: req.body.national_id,
                                role: 0,
                                password: hashedPassword,
                            };

                            const insertUserQuery = "INSERT INTO user SET ?";
                            conn.query(insertUserQuery, userToInsert, (userErr, userResult) => {
                                if (userErr) {
                                    console.error("Error inserting user: " + userErr.stack);
                                    return res.status(500).json({ error: "An error occurred while inserting user" });
                                }
                                return res.status(201).json({ message: " تم بنجاح" });
                            });
                        });
                    });
                });
            });
        });
    } catch (err) {
        console.error("Unexpected error: " + err.stack);
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};


  // نفترض أن الوحدات المطلوبة وإعداد الاتصال موجودة بالفعل فوق هذه الدالة
static async getUserByNationalId(req, res) {
  try {
    const { national_id } = req.params; // نفترض أن الرقم القومي يتم تمريره كمعامل في الطلب

    // التحقق من قيمة الرقم القومي
    if (!national_id) {
      return res.status(400).json({ error: "الرقم القومي مطلوب" });
    }

    // استعلام لجلب المستخدم بناءً على الرقم القومي
    const getUserQuery = 'SELECT * FROM user WHERE national_id = ?';
    conn.query(getUserQuery, [national_id], (err, result) => {
      if (err) {
        console.error('خطأ في جلب المستخدم: ' + err.stack);
        return res.status(500).json({ error: "حدث خطأ أثناء جلب المستخدم" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "لم يتم العثور على المستخدم" });
      }
     

      res.status(200).json({
        message: "تم جلب المستخدم بنجاح.",
        user: result[0],
      });
    });
    
  } catch (error) {
    console.error('خطأ في جلب المستخدم: ' + error.stack);
    res.status(500).json({ error: "حدث خطأ أثناء جلب المستخدم" });
  }
}
static createAdmissionRequest = async (req, res) => {
  try {
    // Check if enrollment is open for the given university
    const checkEnrollmentQuery = 'SELECT is_enrollment_open FROM enrollment WHERE university_name = ?';
    const universityName = req.body.university_name;

    conn.query(checkEnrollmentQuery, [universityName], (enrollmentErr, enrollmentResult) => {
      if (enrollmentErr) {
        console.error("Error checking enrollment status: " + enrollmentErr.stack);
        return res.status(500).json({
          error: "An error occurred while checking enrollment status",
        });
      }

      if (enrollmentResult.length === 0) {
        return res.status(404).json({
          error: "University not found",
        });
      }

      const isEnrollmentOpen = enrollmentResult[0].is_enrollment_open;
      if (!isEnrollmentOpen) {
        return res.status(403).json({
          error: "التسجيل مقفول في الوقت الحالي",
        });
      }

      // Data to insert
      const dataToInsert = {
        university_id: university_id,
        Student_type: StudentType,
        student_id: req.body.student_id,
        nationality: req.body.nationality,
        national_id: req.body.national_id,
        name: req.body.name,
        date_of_birth: req.body.date_of_birth,
        place_of_birth: req.body.place_of_birth,
        gender: req.body.gender,
        religion: req.body.religion,
        residence_address: req.body.residence_address,
        detailed_address: req.body.detailed_address,
        email: req.body.email,
        mobile_number: req.body.mobile_number,
        father_name: req.body.father_name,
        father_national_id: req.body.father_national_id,
        father_occupation: req.body.father_occupation,
        father_phone_number: req.body.father_phone_number,
        guardian_name: req.body.guardian_name,
        guardian_national_id: req.body.guardian_national_id,
        guardian_phone_number: req.body.guardian_phone_number,
        parents_status: req.body.parents_status,
        college: req.body.college,
        level: req.body.level,
        previous_academic_year_gpa: req.body.previous_academic_year_gpa,
        status: defaultStatus,
        password: hashedPassword,
        Housing_in_previous_years: req.body.Housing_in_previous_years,
        housing_type: req.body.housing_type,
        family_abroad: req.body.family_abroad,
        special_needs: req.body.special_needs,
        Secondary_Division: req.body.Secondary_Division,
        Total_grades_high_school: req.body.Total_grades_high_school,
        Passport_number: req.body.Passport_number,
        Passport_issuing_authority: req.body.Passport_issuing_authority,
        distance: distance, // Add the distance to the data
        category: categoryID, // Add the category to the data
        university_name: req.body.university_name,
      };

      const insertQuery = 'INSERT INTO admission_requests SET ?';

      conn.query(insertQuery, dataToInsert, (err, result) => {
        if (err) {
          console.error("Error inserting admission request: " + err.stack);
          return res.status(500).json({
            error: "An error occurred while inserting admission request",
          });
        }

        // If the request is inserted successfully, add the user to the "user" table
        const userToInsert = {
          name: req.body.name,
          email: req.body.email,
          national_id: req.body.national_id,
          role: 0, // Set the role to 0
          password: hashedPassword,
        };

        const insertUserQuery = 'INSERT INTO user SET ?';

        conn.query(insertUserQuery, userToInsert, (userErr, userResult) => {
          if (userErr) {
            console.error("Error inserting user: " + userErr.stack);
            return res.status(500).json({
              error: "An error occurred while inserting user",
            });
          }res.status(201).json({
            message: "Admission request and user have been inserted successfully.",
            admissionRequestData: result,
            userData: userResult,
          });
        });
      });
    });
  } catch (error) {
    console.error("Error inserting admission request: " + error.stack);
    res.status(500).json({ error: "An error occurred while inserting admission request" });
  }
};
  /**
   * @description عرض ارشادات وتعليمات جامعه معينه من خلال اسمها
   * @route /api/student/guidelines
   * @method get
   * @access public
   */
  static getApplicationGuidelinesByName = (req, res) => {
    const universityName = req.query.name; // Updated parameter name

    if (!universityName) {
      return res.status(400).json({ error: "يجب تقديم اسم الجامعة." });
    }

    const getGuidelinesQuery =
      "SELECT guidelines FROM `application guidelines and approvals` WHERE university_id IN (SELECT id FROM universities WHERE name = ?)";

    conn.query(getGuidelinesQuery, [universityName], (err, result) => {
      if (err) {
        console.error("Error executing query: " + err.message);
        return res
          .status(500)
          .json({ error: "حدث خطأ أثناء البحث عن الإرشادات." });
      }

      if (result.length > 0) {
        const guidelines = result[0];
        return res.status(200).json({ guidelines });
      } else {
        return res
          .status(404)
          .json({ message: "لا توجد إرشادات متاحة لهذه الجامعة." });
      }
    });
  };

  /**
   * @description عرض مواعيدالتقديم ل جامعه معينه من خلال اسمها
   * @route /api/student/GetAppointment
   * @method get
   * @access public
   */
  static getAppointmentsByUniversityName = (req, res) => {
    const universityName = req.query.universityName;

    if (!universityName) {
      return res.status(400).json({ error: "يجب تقديم اسم الجامعة." });
    }

    // الاستعلام عن المواعيد باستخدام اسم الجامعة
    const getAppointmentsQuery = `
        SELECT a.* 
        FROM appointments AS a
        JOIN universities AS u ON a.university_id = u.id
        WHERE u.name = ?
    `;

    conn.query(getAppointmentsQuery, [universityName], (err, result) => {
      if (err) {
        console.error("خطأ في الاستعلام: " + err.message);
        return res
          .status(500)
          .json({ error: "حدث خطأ أثناء البحث عن المواعيد." });
      }

      if (result.length > 0) {
        const appointments = result;
        return res.status(200).json({ appointments });
      } else {
        return res
          .status(404)
          .json({ error: "لا توجد مواعيد متاحة لهذه الجامعة." });
      }
    });
  };
  /**
   * @description الاستعلام عن القبول بالرقم القومي
   * @route /api/student/
   * @method get
   * @access public
   */

  static checkAdmissionStatusByNationalId = (req, res) => {
    const nationalId = req.query.national_id;

    const selectQuery =
      "SELECT name, college, university_name, status FROM admission_requests WHERE national_id = ?";

    conn.query(selectQuery, [nationalId], (err, admissionRequestData) => {
      if (err) {
        console.error("Error fetching admission request data: " + err.stack);
        return res.status(500).json({
          error: "An error occurred while fetching admission request data",
        });
      }

      // Check if admission request data exists
      if (admissionRequestData.length === 0) {
        return res.status(404).json({ error: "Admission request not found" });
      }

      const { name, college, university_name, status } =
        admissionRequestData[0];

      res.status(200).json({
        name: name,
        college: college,
        university_name: university_name,
        admissionStatus: status,
      });
    });
  };
  /**
   * @description Update specific fields of an admission request after password verification
   * @route /api/student/updateRequest/:id
   * @method PUT
   * @access public
   */

 static updateAdmissionRequestFields = async (req, res) => {
    const national_id = req.user.national_id;

    // تحديث البيانات إذا كانت الطلبات لم تتم مراجعتها بعد
    const checkExistingQuery = `
        SELECT * FROM admission_requests 
        WHERE national_id = ? AND status = "لم يتم مراجعة الطلب"
    `;
    conn.query(checkExistingQuery, [national_id], async (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Error checking admission request: " + checkErr.stack);
            return res.status(500).json({
                error: "An error occurred while checking admission request",
            });
        }

        // التحقق من وجود الطلب وعدم تغيير حالته
        if (checkResult.length === 0) {
            return res.status(400).json({
                error: "Admission request not found or has been reviewed",
            });
        }

        const admissionRequestData = checkResult[0];

        // تحديث الحقول المحددة
        const updateFields = {};
        for (const field in req.query) {
            if (req.query[field] !== undefined && field !== "national_id") {
                updateFields[field] = req.query[field];
            }
        }

        const updateQuery = "UPDATE admission_requests SET ? WHERE national_id = ?";
        conn.query(updateQuery, [updateFields, national_id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Error updating admission request fields: " + updateErr.stack);
                return res.status(500).json({
                    error: "An error occurred while updating admission request fields",
                });
            }
          

            // بعد تحديث الطلب بنجاح، قم بتحديث بيانات المستخدم في جدول "user"
            const updateUserFields = {};
            if (req.query.name !== undefined) {
                updateUserFields.name = req.query.name;
            }
            if (req.query.email !== undefined) {
                updateUserFields.email = req.query.email;
            }

            const updateUserQuery = "UPDATE user SET ? WHERE national_id = ?";
            conn.query(updateUserQuery, [updateUserFields, national_id], (userUpdateErr, userUpdateResult) => {
                if (userUpdateErr) {
                    console.error("Error updating user data: " + userUpdateErr.stack);
                    return res.status(500).json({
                        error: "An error occurred while updating user data",
                    });
                }

                res.status(200).json({
                    message: "Admission request fields and user data have been updated successfully.",
                    data: updateResult,
                    userData: userUpdateResult,
                });
            });
        });
    });
};

  static getUserAbsences = (req, res) => {
    const nationalId = req.user.national_id; // تفترض أن الرقم القومي مُمرر عبر الطلب

    // استعلام استرجاع الجزاءات للمستخدم بناءً على الرقم القومي
    const getUserAbsencesQuery = `
        SELECT user_absences.*
        FROM user
        INNER JOIN user_absences ON user.id = user_absences.user_id
        WHERE user.national_id = '${nationalId}'
    `;

    // تنفيذ الاستعلام
    conn.query(getUserAbsencesQuery, (err, absences) => {
      if (err) {
        console.error("Error retrieving user absences:", err.stack);
        return res
          .status(500)
          .json({ error: "An error occurred while retrieving user absences" });
      }

      // التحقق مما إذا كان هناك جزاءات أم لا
      if (absences.length === 0) {
        return res.status(200).json({
          message: "No absences found for the user.",
          data: {
            absences: [],
          },
        });
      }

      // إرجاع النتائج إذا وجدت جزاءات
      res.status(200).json({
        message: "User absences retrieved successfully.",
        data: {
          absences: absences,
        },
      });
    });
  };
  static getAdmissionRequestByNationalID = (req, res) => {
    const national_id = req.user.national_id;
  
    const query = `
    SELECT 
      * 
    FROM 
      admission_requests 
    WHERE 
      national_id = ?`;
  
    conn.query(query, [national_id], (err, result) => {
      if (err) {
        console.error("خطأ في الاستعلام: " + err.message);
        return res
          .status(500)
          .json({ error: "حدث خطأ أثناء استرجاع بيانات الطلب." });
      }
  
      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "لا يوجد طلب قبول مرتبط بالرقم القومي المدخل." });
      }
  
      const commonData = {
        university_id: result[0].university_id,
        Total_grades_high_school:result[0].Total_grades_high_school,
        student_type: result[0].student_type,
        student_id: result[0].student_id,
        nationality: result[0].nationality,
        national_id: result[0].national_id,
        name: result[0].name,
        date_of_birth: result[0].date_of_birth,
        place_of_birth: result[0].place_of_birth,
        gender: result[0].gender,
        dormTypeWithoutFood:result[0].dormTypeWithoutFood,
        religion: result[0].religion,
        residence_address: result[0].residence_address,
        detailed_address: result[0].detailed_address,
        email: result[0].email,
        mobile_number: result[0].mobile_number,
        father_name: result[0].father_name,
        father_national_id: result[0].father_national_id,
        father_occupation: result[0].father_occupation,
        father_phone_number: result[0].father_phone_number,
        guardian_name: result[0].guardian_name,
        guardian_national_id: result[0].guardian_national_id,
        guardian_phone_number: result[0].guardian_phone_number,
        parents_status: result[0].parents_status,
        college: result[0].college,
        level: result[0].level,
        status: result[0].status,
        password: result[0].password,
        housing_type: result[0].housing_type,
        family_abroad: result[0].family_abroad,
        special_needs: result[0].special_needs,
        university_name: result[0].university_name,
        Passport_number: result[0].Passport_number,
        Passport_issuing_authority: result[0].Passport_issuing_authority,
      };
  
      if (result[0].student_type === "قديم") {
        const oldStudentData = {
          ...commonData,
          previous_academic_year_gpa: result[0].previous_academic_year_gpa,
          Housing_in_previous_years: result[0].Housing_in_previous_years,
        };
        return res
          .status(200)
          .json({ message: "الطالب قديم", studentData: oldStudentData });
      } else {
        const newStudentData = {
          ...commonData,
          Secondary_Division: result[0].Secondary_Division,
          Total_grades_high_school: result[0].Total_grades_high_school,
          Passport_number: result[0].Passport_number,
          Passport_issuing_authority: result[0].Passport_issuing_authority,
          category: result[0].category,
          distance: result[0].distance,
        };
        return res
          .status(200)
          .json({ message: "الطالب جديد", studentData: newStudentData });
      }
    });
  };
  
  
  
  static getStudentAdmissionDetails = async (req, res) => {
    try {
      const studentId = req.query.id;
  
      // First, get the university name and housing type
      const getAdmissionDetailsQuery = `
        SELECT university_name, housing_type 
        FROM admission_requests 
        WHERE id = ?
      `;
  
      conn.query(getAdmissionDetailsQuery, [studentId], async (checkErr, checkResult) => {
        if (checkErr) {
          console.error('Error checking existing user: ' + checkErr.stack);
          return res.status(500).json({ error: "An error occurred while checking existing user" });
        }
  
        if (checkResult.length === 0) {
          return res.status(404).json({
            message: "No admission details found for the student.",
            data: {
              universityName: null,
              housingType: null,
              fee: null,
            },
          });
        }
  
        const { university_name, housing_type } = checkResult[0];
  
        // Then, get the admission fee based on the university name and housing type
        const getFeeQuery = `
          SELECT fees
          FROM housing_fees
          WHERE university_name = ? AND housing_type = ?
        `;
  
        conn.query(getFeeQuery, [university_name, housing_type], async (feeErr, feeResult) => {
          if (feeErr) {
            console.error('Error retrieving admission fee: ' + feeErr.stack);
            return res.status(500).json({ error: "An error occurred while retrieving admission fee" });
          }
  
          let fee = null;
          if (feeResult.length > 0) {
            fee = feeResult[0].fees;
          }
  
          return res.status(200).json({
            message: " تم بنجاح.",
            data: {
              universityName: university_name,
              housingType: housing_type,
              fee: fee || "Unknown",
            },
          });
        });
      });
    } catch (err) {
      console.error("Error retrieving admission details:", err.stack);
      return res.status(500).json({
        error: "An error occurred while retrieving admission details",
      });
    }
  };
  
  
}

module.exports = studentController;
