/* eslint-disable no-useless-escape */
const {body, validator} = require('./validator')

const email = body("email")
	.exists({ checkFalsy: true })
	.withMessage("Email is required")
	.matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
	.withMessage("Invalid email format");

const password = body("password")
	.exists({ checkFalsy: true })
	.withMessage("Password is required")
	.isLength({ min: 8 })
	.withMessage("Password must contain atleast 8 characters");

const LoginSchema = [
    email,
	password,
    validator
]

module.exports = LoginSchema