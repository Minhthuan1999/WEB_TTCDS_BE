// const http = require("./app")
// const dotenv = require("dotenv")
// const db = require('./database/db.js')


// dotenv.config({
//     path: "./config/.env"
// })
// //connect database

// //create server

// http.listen(process.env.PORT || 8000, () => {
//     console.log(`Listening on ${process.env.PORT}...`)
// })

require('dotenv').config({ path: './config/.env' });
const http = require("./app");

const PORT = process.env.PORT || 8000;

http.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});


