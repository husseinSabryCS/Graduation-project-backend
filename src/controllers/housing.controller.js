const conn = require("../models/dbConnectoin");

class HousingController {

  static allocateRoom = (req, res) => {
    const roomNumber = req.params.roomNumber;
    console.log(roomNumber);
    // Get room status
    const roomQuery = 'SELECT status FROM rooms WHERE room_number = ? LIMIT 1';
    conn.query(roomQuery, [roomNumber], (err, roomResult) => {
      if (err) {
        console.error('Error fetching room data: ' + err.stack);
        return res.status(500).json({ error: "An error occurred while fetching room data" });
      }

      if (roomResult.length === 0) {
        return res.status(404).json({ error: "Room not found" });
      }

      const roomData = roomResult[0];

      // Check room status
      if (roomData.status === 1) {
        // Room is available
       
        res.status(200).json({
          message: "Room is available.",
          data: {
            roomNumber: roomNumber
          }
        });
      } else {
        // Room is not available
        res.status(404).json({ error: "Room not available" });
      }
    });
  };
 static assignRoom = (req, res) => {
    const nationalId = req.query.nationalId;

    // Retrieve gender of the applicant from admission_requests table
    const getApplicantGenderQuery = `SELECT gender FROM admission_requests WHERE national_id = ? LIMIT 1`;

    conn.query(getApplicantGenderQuery, [nationalId], (err, applicantGenderResult) => {
        if (err) {
            console.error('Error retrieving applicant gender:', err.stack);
            return res.status(500).json({ error: "An error occurred while retrieving applicant gender" });
        }

        // If applicant's gender is not found, return an error
        if (applicantGenderResult.length === 0) {
            return res.status(404).json({ error: "Applicant's gender not found" });
        }

        const applicantGender = applicantGenderResult[0].gender;

        // Define the room type query based on applicant's gender and building's gender
        let roomTypeQuery = '';

        if (applicantGender === 'ذكر') {
            roomTypeQuery = `
                SELECT rooms.id, rooms.status, rooms.cap, rooms.NumberOfResidents 
                FROM rooms 
                INNER JOIN buildings ON rooms.building_id = buildings.id 
                WHERE rooms.status = 1 AND buildings.gender = 'ذكر' 
                LIMIT 1`;
        } else {
            roomTypeQuery = `
                SELECT rooms.id, rooms.status, rooms.cap, rooms.NumberOfResidents 
                FROM rooms 
                INNER JOIN buildings ON rooms.building_id = buildings.id 
                WHERE rooms.status = 1 AND buildings.gender = 'انثى' 
                LIMIT 1`;
        }

        // Check if the user already exists
        const checkUserQuery = `SELECT * FROM user WHERE national_id = ? LIMIT 1`;

        conn.query(checkUserQuery, [nationalId], (err, userResult) => {
            if (err) {
                console.error('Error checking user data:', err.stack);
                return res.status(500).json({ error: "An error occurred while checking user data" });
            }

            // If the user doesn't exist, return an error
            if (userResult.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            // Check if the user already has a room assigned
            const checkUserRoomQuery = `SELECT room_id FROM user WHERE national_id = ? LIMIT 1`;

            conn.query(checkUserRoomQuery, [nationalId], (err, userRoomResult) => {
                if (err) {
                    console.error('Error checking user room data:', err.stack);
                    return res.status(500).json({ error: "An error occurred while checking user room data" });
                }

                // If the user already has a room assigned, return that information
                if (userRoomResult.length > 0 && userRoomResult[0].room_id !== null) {
                    const userAssignedRoomId = userRoomResult[0].room_id;
                    return res.status(200).json({
                        message: "User already assigned to a room.",
                        data: {
                            userId: nationalId,
                            assignedRoomId: userAssignedRoomId
                        }
                    });
                }

                // Fetch room data based on gender and availability
                conn.query(roomTypeQuery, (err, roomResult) => {
                    if (err) {
                        console.error('Error fetching room data:', err.stack);
                        return res.status(500).json({ error: "An error occurred while fetching room data" });
                    }

                    if (roomResult.length === 0) {
                        return res.status(404).json({ error: "No available rooms" });
                    }

                    const roomData = roomResult[0];

                    // Increment occupants count
                    const newOccupantsCount = roomData.NumberOfResidents + 1;

                    // Update room data
                    const updateRoomQuery = `UPDATE rooms SET NumberOfResidents = ?, status = ? WHERE id = ?`;

                    conn.query(updateRoomQuery, [newOccupantsCount, (newOccupantsCount === roomData.cap) ? 0 : 1, roomData.id], (err, updateRoomResult) => {
                        if (err) {
                            console.error('Error updating room status:', err.stack);
                            return res.status(500).json({ error: "An error occurred while updating room status" });
                        }

                        // Update user data with room assignment
                        const updateUserQuery = `UPDATE user SET room_id = ? WHERE national_id = ?`;

                        conn.query(updateUserQuery, [roomData.id, nationalId], (err, updateUserResult) => {
                            if (err) {
                                console.error('Error updating user data:', err.stack);
                                return res.status(500).json({ error: "An error occurred while updating user data" });
                            }

                            // Success
                            res.status(201).json({
                                message: "Room assigned successfully.",
                                data: {
                                    userId: nationalId,
                                    room: roomData
                                }
                            });
                        });
                    });
                });
            });
        });
    });
};

static getAcceptedStudents = (req, res) => {
  let acceptedStatus = 'مقبول';
  let universityName = req.query.universityName; // اسم الجامعة
  let gender = req.query.gender;

  let conditions = [];
  if (gender) {
    conditions.push(gender = '${gender}');
  }

  let conditionsQuery = conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '';

  // استعلام لاختيار الطلاب المقبولين
  const selectAcceptedStudentsQuery = `
    SELECT admission_requests.*, user.* 
    FROM admission_requests 
    JOIN user ON admission_requests.national_id = user.national_id 
    WHERE admission_requests.university_name = ? ${conditionsQuery} AND admission_requests.status = ? AND user.room_id IS NULL
  `;

  const queryParams = [universityName, acceptedStatus];

  conn.query(selectAcceptedStudentsQuery, queryParams, (err, results) => {
    if (err) {
      console.error('خطأ في استرجاع الطلاب المقبولين:', err.stack);
      return res.status(500).json({ error: "حدث خطأ أثناء استرجاع الطلاب المقبولين" });
    }

    // إذا لم يكن هناك طلاب مقبولين، قم بإرجاع مصفوفة فارغة
    if (results.length === 0) {
      return res.status(404).json({ message: "لم يتم العثور على طلاب مقبولين" });
    }

    // إذا كان هناك طلاب مقبولين، قم بإرجاعهم
    res.status(200).json({ acceptedStudents: results });
  });
};

  static UsersHaveRooms = (req, res) => {
    // الاستعلام لاسترجاع المستخدمين حسب room_id و role
    const selectUsersQuery = 'SELECT * FROM user WHERE room_id IS NOT NULL AND role = 0';
  
    conn.query(selectUsersQuery, (err, results) => {
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
  static UsersHaveRooms = (req, res) => {
    // الاستعلام لاسترجاع المستخدمين حسب room_id و role
    const selectUsersQuery = `SELECT * FROM user WHERE room_id IS NOT NULL AND role = 0`;
  
    conn.query(selectUsersQuery, (err, results) => {
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

  static getCountUsersWithRoomId = (req, res) => {
    // الاستعلام لاسترجاع عدد المستخدمين حسب room_id
    const countUsersQuery = `SELECT COUNT(*) AS count FROM user WHERE room_id IS NOT NULL`;
  
    conn.query(countUsersQuery, (err, results) => {
      if (err) {
        console.error('خطأ في استرجاع عدد المستخدمين:', err.stack);
        return res.status(500).json({ error: "حدث خطأ أثناء استرجاع عدد المستخدمين" });
      }
  
      // إذا لم يكن هناك مستخدمين، قم بإرجاع قيمة صفر
      if (results.length === 0) {
        return res.status(404).json({ count: 0 });
      }
  
      // إرجاع عدد المستخدمين
      res.status(200).json({ count: results[0].count });
    });
  };
  
  
  
}

module.exports = HousingController;
