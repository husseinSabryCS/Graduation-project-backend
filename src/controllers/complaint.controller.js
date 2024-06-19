const conn = require('../models/dbConnectoin');

class ComplaintController {
    static createComplaint = (req, res) => {
        const  studentName  = req.user.name;
        const {complaintText }=req.body

        if (!studentName || !complaintText) {
            return res.status(400).json({ error: "Student name and complaint text are required" });
        }

        const query = `
            INSERT INTO complaints (student_name, complaint_text, reviewed)
            VALUES (?, ?, FALSE)
        `;
        
        conn.query(query, [studentName, complaintText], (err, result) => {
            if (err) {
                console.error('Error inserting complaint:', err.stack);
                return res.status(500).json({ error: "An error occurred while submitting the complaint" });
            }
            res.status(201).json({ message: "Complaint submitted successfully", complaintId: result.insertId });
        });
    };
    static getComplaintsByStudentName = (req, res) => {
        const  studentName  = req.user.name;
    
        if (!studentName) {
            return res.status(400).json({ error: "Student name is required" });
        }
    
        const query = `
            SELECT id, student_name, complaint_text, reviewed, created_at
            FROM complaints
            WHERE student_name = ?
        `;
        
        conn.query(query, [studentName], (err, results) => {
            if (err) {
                console.error('Error fetching complaints:', err.stack);
                return res.status(500).json({ error: "An error occurred while fetching complaints" });
            }
            res.status(200).json(results);
        });
    };
    
    
    static getAllComplaints = (req, res) => {
        const query = `
            SELECT id, student_name, complaint_text, reviewed, created_at
            FROM complaints
        `;
        
        conn.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching complaints:', err.stack);
                return res.status(500).json({ error: "An error occurred while fetching complaints" });
            }
            res.status(200).json(results);
        });
    };

    static deleteComplaint = (req, res) => {
        const { id } = req.query;
    
        if (!id) {
            return res.status(400).json({ error: "Complaint ID is required" });
        }
    
        const query = `
            DELETE FROM complaints
            WHERE id = ?
        `;
    
        conn.query(query, [id], (err, result) => {
            if (err) {
                console.error('Error deleting complaint:', err.stack);
                return res.status(500).json({ error: "An error occurred while deleting the complaint" });
            }
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Complaint not found" });
            }
    
            res.status(200).json({ message: "تم الحذف بنجاح" });
        });
    };
    
    static updateComplaintReviewStatus = (req, res) => {
        const { id } = req.query;
        // const { reviewed } = true;

        // if (typeof reviewed !== 'boolean') {
        //     return res.status(400).json({ error: "Reviewed status must be a boolean" });
        // }

        const query = `
            UPDATE complaints
            SET reviewed = 1
            WHERE id = ?
        `;
        
        conn.query(query, [ id], (err, result) => {
            if (err) {
                console.error('Error updating complaint review status:', err.stack);
                return res.status(500).json({ error: "An error occurred while updating the review status" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Complaint not found" });
            }
            res.status(200).json({ message: "تم التحديث بنجاح" });
        });
    };
}

module.exports = ComplaintController;
