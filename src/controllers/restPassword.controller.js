const nodemailer = require('nodemailer');
// const cron = require('node-cron');
const cron = require('cron');

const conn = require("../models/dbConnectoin");
const bcrypt = require('bcrypt');
const moment = require('moment');

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'husseinsabry525@gmail.com',
        pass: 'guro jkjj jphq olcv'
    }
});

// UserModel class
class UserModel {
    static getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            conn.query('SELECT * FROM user WHERE email = ?', [email], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.length > 0 ? results[0] : null);
                }
            });
        });
    }

    static updatePasswordByEmail(email, password) {
        return new Promise((resolve, reject) => {
            conn.query('UPDATE user SET password = ? WHERE email = ?', [password, email], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
}

// Function to send mail
function sendMail(reqEmail, randomCode, res) {
    const mailOptions = {
        from: 'sabryhusseinhussein@gmail.com',
        to: reqEmail,
        subject: 'Your 6-digit Code',
        text: `Your 6-digit code is: ${randomCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'Email sent successfully' });
    });
}

class RestPassword {
    static sendPasswordByEmail = async (req, res) => {
        const { reqEmail } = req.body;

        try {
            // Delete any existing code for the email
            conn.query('DELETE FROM password_reset WHERE email = ?', [reqEmail], async (error, deleteResult) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                // Generate a new code
                const randomCode = Math.floor(100000 + Math.random() * 900000);
                const hashedCode = await bcrypt.hash(randomCode.toString(), 10); // Hash the random code

                // Insert the new code with the current timestamp into the database
                conn.query('INSERT INTO password_reset (email, code, created_at) VALUES (?, ?, NOW())', [reqEmail, hashedCode], (error, insertResult) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    // Send the code via email
                    sendMail(reqEmail, randomCode, res);
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    static resetPassword = async (req, res) => {
        const { reqEmail, code, password } = req.body;

        if (!reqEmail) {
            return res.status(400).json({ message: 'Email is required' });
        }

        try {
            // Retrieve reset information from the database
            conn.query('SELECT * FROM password_reset WHERE email = ?', [reqEmail], async (error, results) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                const resetInfo = results[0];

                if (!resetInfo) {
                    return res.status(400).json({ message: 'No reset code found for this email' });
                }

                // Compare the hashed code
                const isCodeValid = await bcrypt.compare(code, resetInfo.code);
                if (!isCodeValid) {
                    return res.status(400).json({ message: 'Invalid reset code' });
                }

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Update the password in the database
                await UserModel.updatePasswordByEmail(reqEmail, hashedPassword);

                // Delete reset information from the database
                conn.query('DELETE FROM password_reset WHERE email = ?', [reqEmail], (error, results) => {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                    return res.status(200).json({ message: 'Password updated successfully' });
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
    static deleteOldRecords() {
        const thirtyMinutesAgo = new Date(Date.now() -60 * 60000).toISOString().slice(0, 19).replace('T', ' ');
        const deleteQuery = `DELETE FROM password_reset WHERE created_at < '${thirtyMinutesAgo}'`;

        conn.query(deleteQuery, (error, results, fields) => {
            if (error) {
                console.error('Error deleting old records:', error);
            } else {
                console.log('Deleted old records successfully.');
            }
        });
    }
}

// تنفيذ وظيفة حذف السجلات كل خمس دقائق
const job = new cron.CronJob('0 0 */1 * * *', RestPassword.deleteOldRecords);

job.start();

module.exports = RestPassword;
