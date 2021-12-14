const { register, login } = require('../controllers/AuthController')
const LoginSchema = require('../schema/LoginSchema')
const RegisterSchema = require('../schema/RegisterSchema')

const router = require('express').Router()

/* register */
/* http://host:port/api/auth/register */
router.post("/register", RegisterSchema, register)

/* login */
/* http://host:port/api/auth/login */
router.post("/login", LoginSchema, login)

module.exports = router