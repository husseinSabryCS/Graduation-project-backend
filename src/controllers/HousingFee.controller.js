const conn = require("../models/dbConnectoin");

class HousingFee {
  static createHousingFee(req, res) {
    const { universityName, housingType, fees, feeding } = req.body;
    

    if (!universityName || !housingType || !fees || feeding === undefined) {
        return res.status(400).json({ error: "University name, housing type, fees, and feeding are required" });
    }

    const checkExistingQuery = `
        SELECT id, fees
        FROM housing_fees
        WHERE university_name = ? AND housing_type = ? AND feeding = ?
    `;

    conn.query(checkExistingQuery, [universityName, housingType, feeding], (checkErr, checkResult) => {
        if (checkErr) {
            console.error("Error checking existing housing fee:", checkErr.stack);
            return res.status(500).json({ error: "An error occurred while checking existing housing fee" });
        }

        if (checkResult.length > 0) {
            // Update the existing record with new fees
            const existingFees = checkResult[0].fees;
            if (existingFees !== fees) {
                const updateQuery = `
                    UPDATE housing_fees
                    SET fees = ?
                    WHERE university_name = ? AND housing_type = ? AND feeding = ?
                `;

                conn.query(updateQuery, [fees, universityName, housingType, feeding], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error("Error updating housing fee:", updateErr.stack);
                        return res.status(500).json({ error: "An error occurred while updating the housing fee" });
                    }

                    return res.status(200).json({ message: "Housing fee updated successfully" });
                });
            } else {
                return res.status(200).json({ message: "Housing fee already exists with the same fees. No update needed." });
            }
        } else {
            // Insert a new record
            const insertQuery = `
                INSERT INTO housing_fees (university_name, housing_type, fees, feeding)
                VALUES (?, ?, ?, ?)
            `;

            conn.query(insertQuery, [universityName, housingType, fees, feeding], (insertErr, insertResult) => {
                if (insertErr) {
                    console.error("Error inserting housing fee:", insertErr.stack);
                    return res.status(500).json({ error: "An error occurred while adding the housing fee" });
                }

                return res.status(201).json({ message: "Housing fee added successfully", feeId: insertResult.insertId });
            });
        }
    });
}


      static getAllHousingFees(req, res) {
        const universityName = req.query.universityName; // الحصول على اسم الجامعة من استعلام الـ URL
      
        const query = `
          SELECT *
          FROM housing_fees
          WHERE university_name = ?
        `;
    
        conn.query(query, [universityName], (err, results) => {
            if (err) {
                console.error("Error fetching housing fees:", err.stack);
                return res.status(500).json({ error: "An error occurred while fetching housing fees" });
            }
    
            return res.status(200).json(results);
        });
    }
    
      static updateHousingFee(req, res) {
        const { id } = req.query;
        const { universityName, housingType, fees,feeding } = req.body;
      
        if (!universityName || !housingType || !fees || !feeding) {
          return res.status(400).json({ error: "All fields are required" });
        }
      
        const query = `
          UPDATE housing_fees
          SET university_name = ?, housing_type = ?, fees = ?,fees = ?
          WHERE id = ?
        `;
      
        conn.query(query, [universityName, housingType, fees,feeding, id], (err, result) => {
          if (err) {
            console.error("Error updating housing fee:", err.stack);
            return res.status(500).json({ error: "An error occurred while updating the housing fee" });
          }
      
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Housing fee not found" });
          }
      
          return res.status(200).json({ message: "Housing fee updated successfully" });
        });
      }
      
      static deleteHousingFee(req, res) {
        const { id } = req.query;
      
        const query = `
          DELETE FROM housing_fees
          WHERE id = ?
        `;
      
        conn.query(query, [id], (err, result) => {
          if (err) {
            console.error("Error deleting housing fee:", err.stack);
            return res.status(500).json({ error: "An error occurred while deleting the housing fee" });
          }
      
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Housing fee not found" });
          }
      
          return res.status(200).json({ message: "Housing fee deleted successfully" });
        });
      }
}

module.exports = HousingFee;
