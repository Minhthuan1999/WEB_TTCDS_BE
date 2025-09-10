const mysql = require("mysql2");

const db = mysql.createPool({
// Máy chủ local
  host: "127.0.0.1",
  user: "root",
  password: "123456789",
  database: "webttcds",

// Máy chủ Laptop
// host: "192.168.2.19",
// user: "webcds",
// password: "Admincds@2025",
// database: "webttcds",

// Máy chủ Centos
// host: "192.168.59.153",
// user: "root",
// password: "123456789",
// database: "webttcds",

// Máy chủ TTDL
// host: "10.161.5.229",
// user: "root",
// password: "123456789",
// database: "baclieuict",

// Máy chủ Render
// host: "bzajplxl6n12rq8keyp6-mysql.services.clever-cloud.com",
// user: "utrk57vmpbjvhk2w",
// password: "TuzmUcY5svDAJ8qQjrZP",
// database: "bzajplxl6n12rq8keyp6",
  
  waitForConnections: true,
  connectionLimit: 10,
  port: 3306
});

db.getConnection((err, connection) => {
  if (err) throw err
  console.log('Database connected.')
})

// db.connect((err) => {
//   if (err) {
//     console.error("Error: ", err);
//     return;
//   }
//   console.log("Connected to MySQL...");
// });

module.exports = db;
