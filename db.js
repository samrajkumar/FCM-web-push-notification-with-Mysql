var mysql = require('mysql');
var connection = mysql.createConnection({
				host: "192.168.1.123",
				user: "root",
				password: "",
				database: ""
            });

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;