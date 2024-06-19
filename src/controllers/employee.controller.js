const conn = require("../models/dbConnectoin");

class employeeController {
  /**
   * @description Accept an admission request and insert data into the acceptinguserdata table
   * @route /api/student/accept-request/:id
   * @method POST
   * @access public
   */
  static acceptAdmissionRequest = (req, res) => {
    const admissionRequestId = req.query.id;

    // بدء المعاملة
    conn.beginTransaction(function (err) {
      if (err) {
        console.error("Error starting transaction: " + err.stack);
        return res
          .status(500)
          .json({ error: "An error occurred while starting the transaction" });
      }

      // تحديث حالة الطلب في جدول admission_requests إلى "مقبول"
      const updateStatusQuery =
        'UPDATE admission_requests SET status = "مقبول" WHERE id = ?';
      conn.query(
        updateStatusQuery,
        [admissionRequestId],
        (err, updateResult) => {
          if (err) {
            console.error(
              "Error updating admission request status: " + err.stack
            );
            return conn.rollback(function () {
              res.status(500).json({
                error:
                  "An error occurred while updating admission request status",
              });
            });
          }

          // الآن يمكنك استعلام بيانات طلب القبول
          const selectQuery = "SELECT * FROM admission_requests WHERE id = ?";
          conn.query(
            selectQuery,
            [admissionRequestId],
            (err, admissionRequestData) => {
              if (err) {
                console.error(
                  "Error fetching admission request data: " + err.stack
                );
                return conn.rollback(function () {
                  res.status(500).json({
                    error:
                      "An error occurred while fetching admission request data",
                  });
                });
              }

              if (admissionRequestData.length === 0) {
                return conn.rollback(function () {
                  res
                    .status(404)
                    .json({ error: "Admission request not found" });
                });
              }

              // إتمام المعاملة بنجاح
              conn.commit(function (err) {
                if (err) {
                  console.error("Error committing transaction: " + err.stack);
                  return conn.rollback(function () {
                    res.status(500).json({
                      error:
                        "An error occurred while committing the transaction",
                    });
                  });
                }

                // عند الانتهاء بنجاح
                res.status(201).json({
                  message:
                    "Admission request has been accepted and processed successfully.",
                  data: admissionRequestData[0],
                });
              });
            }
          );
        }
      );
    });
  };
  static rejectAdmissionRequest = (req, res) => {
    const admissionRequestId = req.query.id; // تغيير req.query.id إلى req.params.id لاستخدام route parameter

    // بدء المعاملة
    conn.beginTransaction(function (err) {
      if (err) {
        console.error("Error starting transaction: " + err.stack);
        return res.status(500).json({ error: "An error occurred while starting the transaction" });
      }

      // تحديث حالة الطلب في جدول admission_requests إلى "مرفوض"
      const updateStatusQuery = 'UPDATE admission_requests SET status = "مرفوض" WHERE id = ?';
      conn.query(updateStatusQuery, [admissionRequestId], (err, updateResult) => {
        if (err) {
          console.error("Error updating admission request status: " + err.stack);
          return conn.rollback(function () {
            res.status(500).json({ error: "An error occurred while updating admission request status" });
          });
        }

        // إتمام المعاملة بنجاح
        conn.commit(function (err) {
          if (err) {
            console.error("Error committing transaction: " + err.stack);
            return conn.rollback(function () {
              res.status(500).json({ error: "An error occurred while committing the transaction" });
            });
          }

          // عند الانتهاء بنجاح
          res.status(200).json({
            message: "Admission request has been rejected successfully.",
            data: { id: admissionRequestId, status: "مرفوض" }
          });
        });
      });
    });
  };

  static getAllAdmissionRequests = (req, res) => {
    const universityName = req.query.university_name;

    const selectQuery = `SELECT * FROM admission_requests WHERE university_name = ? AND status = 'لم يتم مراجعة الطلب' ORDER BY distance DESC`;

    conn.query(selectQuery, [universityName], (err, results) => {
      if (err) {
        console.error("Error fetching admission requests: " + err.stack);
        return res.status(500).json({ error: "An error occurred while fetching admission requests" });
      }

      res.status(200).json({
        message: "All pending admission requests for the specified university have been retrieved successfully.",
        data: results,
      });
    });
  };

  static async blockStudent(req, res) {
    try {
      const { national_id } = req.params; // Assuming the user ID is passed as a parameter

      // Check if the user exists
      const query = util.promisify(conn.query).bind(conn);
      const user = await query("SELECT * FROM user WHERE national_id = ?", [
        national_id,
      ]);

      if (user.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "User not found!" }],
        });
      }

      // Check if the user has admin role (role = 2)
      if (user[0].role !== 0) {
        return res.status(403).json({
          errors: [{ msg: "Cannot block an admin user or employee ." }],
        });
      }

      // Update the blocked status in the database
      await query("UPDATE user SET blocked = true WHERE national_id = ?", [
        national_id,
      ]);

      res.status(200).json({
        message: "User has been blocked successfully.",
      });
    } catch (err) {
      console.error("Error blocking user:", err);
      res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
    }
  }
  static async unblockUser(req, res) {
    try {
      const { national_id } = req.query; // Assuming the user ID is passed as a parameter

      // Check if the user exists
      const query = util.promisify(conn.query).bind(conn);
      const user = await query("SELECT * FROM user WHERE national_id = ?", [
        national_id,
      ]);

      if (user.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "User not found!" }],
        });
      }

      // Update the blocked status in the database
      await query("UPDATE user SET blocked = false WHERE national_id = ?", [
        national_id,
      ]);

      res.status(200).json({
        message: "User has been unblocked successfully.",
      });
    } catch (err) {
      console.error("Error unblocking user:", err);
      res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
    }
  }
}
module.exports = employeeController;
