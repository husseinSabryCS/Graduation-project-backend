const express = require("express");
const conn = require("./src/models/dbConnectoin");
const app = express();
const JWT = require("jsonwebtoken");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("upload"));

const session = require('express-session');


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
const cors = require("cors");

app.use(cors());


//======================================================================
const studentRouter = require("./src/routes/student.Router");
const employeeRouter = require("./src/routes/employee.Router");
const adminRouter = require("./src/routes/admin.Router");
const ComplaintRouter = require("./src/routes/Complaint.Router");
const chatBotRouter = require("./src/routes/chatBot.Router");
const loginRouter = require("./src/routes/login.Router");
const restPassword = require("./src/routes/restPassword.Router");
const BasicData = require("./src/routes/BasicData.Router");
const mealsRouter = require("./src/routes/meals.Router");
const housingRouter = require("./src/routes/housing.Router");
const supervising_systemRouter = require("./src/routes/supervising_system.Router");
const ReportsRouter = require("./src/routes/reports.Router");
const HousingFeeRouter = require("./src/routes/HousingFee.Router");
//======================================================================
app.use("/api/student", studentRouter);
app.use("/api/meals", mealsRouter);
app.use("/api/password", restPassword);
app.use("/api/employee", employeeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chatBot", chatBotRouter);
app.use("/api/login", loginRouter);
app.use("/api/BasicDate", BasicData);
app.use("/api/housing", housingRouter);
app.use("/api/supervising_system", supervising_systemRouter);
app.use("/api/report",ReportsRouter );
app.use("/api/Complaint",ComplaintRouter );
app.use("/api/HousingFee",HousingFeeRouter );

app.use(express.static("upload"));
const port = 5000;
app.listen(port, () => {
  console.log('server is running ${port}');
});
module.exports = app;