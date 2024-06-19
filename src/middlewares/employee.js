const { role } = require("os");
const conn = require("../models/dbConnectoin");
const util = require("util"); // helper

const admin = async (req, res, next) => {
  const query = util.promisify(conn.query).bind(conn);
  const { national_id } = req.headers;
  const admin = await query("select * from user where national_id = ?", [national_id]);
  if (admin[0] && admin[0].role == "1") {
    next();
  } else {
    res.status(403).json({
      msg: "you are not authorized to access this route !",
    });
  }
};

module.exports = admin;