const jwt = require("jsonwebtoken")
require('dotenv').config()

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        jwt.verify(token, process.env.SEC_ACCESS_TOKEN, (err, data) => {
            if (err) res.status(403).json({ message: "Token is not valid" })
            req.user = data;
            next()
        })
    } else {
        return res.status(401).json({ message: "You are not authenticated" })
    }
}

const verifyAuthorization = (req, res, next) => {
    if (req.user.id == req.params.id || req.user.is_admin) {
        next()
    } else {
        res.status(403).send({ message: "You are not allowed" })
    }
}

const verifyAdmin = (req, res, next) => {
    if (req.user.is_admin) {
        next()
    } else {
        res.status(403).send({ message: "You are not allowed" })
    }
}

module.exports = {
    verifyToken,
    verifyAuthorization,
    verifyAdmin
}