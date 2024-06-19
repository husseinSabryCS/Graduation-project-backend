const mysql = require('mysql');

const connection= mysql.createConnection({
    host: "localhost",
    user: "root", 
    password: "", 
    database: "GP"
});


connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('db connection ');
});
module.exports=connection;
