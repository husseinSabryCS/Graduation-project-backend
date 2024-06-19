const conn = require("../models/dbConnectoin");
const bcrypt = require("bcrypt");
const util = require("util");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const secret = "huu123";
class loginController {
  static login = async (req, res) => {
    try {
      const schema = Joi.object({
        national_id: Joi.string().required(),
        password: Joi.string().required(),
      });

      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ errors: [{ msg: error.message }] });
      }

      const query = util.promisify(conn.query).bind(conn);
      const user = await query("SELECT * FROM user WHERE national_id = ?", [
        req.body.national_id,
      ]);

      if (user.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "الرقم القومي غير موجود!" }],
        });
      }

      if (user[0].blocked) {
        return res.status(403).json({
          errors: [{ msg: " المستخدم محظور ." }],
        });
      }

      const checkPassword = await bcrypt.compare(
        req.body.password,
        user[0].password
      );

      if (checkPassword) {
        delete user[0].password;

        // Generate JWT token
        const token = jwt.sign(
          {
            id: user[0].id,
            national_id: user[0].national_id,
            role: user[0].role,
            name: user[0].name,
          },
          secret,
          { expiresIn: "1d" }
        );
        // res.setHeader("Authorization", "Bearer " + token);
        // res.setHeader("user", user[0]);
        return res
          .status(200)
          .json({ message: "Successful login", token, role: user[0].role});
      } else {
        return res.status(404).json({
          errors: [{ msg: "كلمه المرور غير صحيحه!" }],
        });
      }
    } catch (err) {
      console.error("Error in login:", err);
      res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
    }
  };

  static async blockUser(req, res) {
    try {
      const { national_id } = req.params;

      const query = util.promisify(conn.query).bind(conn);
      const user = await query("SELECT * FROM user WHERE national_id = ?", [
        national_id,
      ]);

      if (user.length === 0) {
        return res.status(404).json({
          errors: [{ msg: "User not found!" }],
        });
      }

      if (user[0].role === 2) {
        return res.status(403).json({
          errors: [{ msg: "Cannot block an admin user." }],
        });
      }

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
}

module.exports = loginController;
