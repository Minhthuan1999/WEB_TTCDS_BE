const bcrypt = require('bcryptjs');
const { json } = require('express');
const jwt = require('jsonwebtoken')


exports.authenToken = (req, res, next) => {

    const token = req.cookies.token

    if (!token) return res.status(401).json('Bạn không thể thực hiện thao tác này');

    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {

        if (err) {
            return res.status(403).json('Quyền truy cập không hợp lệ');   
        }
        next();
    });
}

