const conn = require("../models/dbConnectoin");

class BasicDataController{

//=================================================================================
  
static getStudentDataByNationalId = (req, res) => {
    const nationalId = req.query.national_id;
  
    const selectQuery = 'SELECT * FROM admission_requests WHERE national_id = ?';
  
    conn.query(selectQuery, [nationalId], (err, studentData) => {
      if (err) {
        console.error('Error fetching student data: ' + err.stack);
        return res.status(500).json({ error: "An error occurred while fetching student data" });
      }
  
      // Check if student data exists
      if (studentData.length === 0) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      res.status(200).json({
        studentData: studentData[0]
      });
    });
  };
  //==========================================================================================
  static getFemaleStudents = (req, res) => {
    const selectQuery = 'SELECT * FROM admission_requests WHERE gender = "أنثى"';
  
    conn.query(selectQuery, (err, femaleStudentsData) => {
      if (err) {
        console.error('Error fetching female students data: ' + err.stack);
        return res.status(500).json({ error: "An error occurred while fetching female students data" });
      }
  
      // Check if any female students data exists
      if (femaleStudentsData.length === 0) {
        return res.status(404).json({ error: "No female students found" });
      }
  
      res.status(200).json({
        femaleStudentsData: femaleStudentsData
      });
    });
  };
  //================================================================================================
  static getMaleStudents = (req, res) => {
    const selectQuery = 'SELECT * FROM admission_requests WHERE gender = "ذكر"';
  
    conn.query(selectQuery, (err, maleStudentsData) => {
      if (err) {
        console.error('Error fetching male students data: ' + err.stack);
        return res.status(500).json({ error: "An error occurred while fetching male students data" });
      }
  
      // Check if any male students data exists
      if (maleStudentsData.length === 0) {
        return res.status(404).json({ error: "No male students found" });
      }
  
      res.status(200).json({
        maleStudentsData: maleStudentsData
      });
    });
  };
//===========================================================================
static searchStudentsByNationalId = async (req, res) => {
  let search = "";
  if (req.query.search) {
    // QUERY PARAMS
    search = `WHERE national_id LIKE '%${req.query.search}%' OR name LIKE '%${req.query.search}%'`;
  }

  try {
    const students = await new Promise((resolve, reject) => {
      conn.query(`SELECT * FROM admission_requests ${search}`, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    return res.status(200).json({
      students: students
    });
  } catch (error) {
    console.error('Error fetching students: ' + error.stack);
    return res.status(500).json({ error: "An error occurred while fetching students data" });
  }
};

}

module.exports=BasicDataController;