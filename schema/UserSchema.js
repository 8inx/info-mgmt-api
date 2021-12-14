/* eslint-disable no-useless-escape */
const {validator, body} = require('./validator')

const email = body("email")
	.exists({ checkFalsy: true })
	.withMessage("Email is required")
	.matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
	.withMessage("Invalid email format")

const password = body("password")
	.exists({ checkFalsy: true })
	.withMessage("Password is required")
	.isLength({ min: 8 })
	.withMessage("Password must contain atleast 8 characters")
	
const first_name = body("first_name")
	.exists({ checkFalsy: true })
	.withMessage("First name is required")
	.isLength({ min: 2 })
	.withMessage("First name must contain atleast 2 characters")
	.matches(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{1,}$/)
	.withMessage("Invalid first name format")

const last_name = body("last_name")
	.exists({ checkFalsy: true })
	.withMessage("Last name is required")
	.isLength({ min: 2 })
	.withMessage("Last name must contain atleast 2 characters")
	.matches(/^[\w'\-,.][^0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;:[\]]{1,}$/)
	.withMessage("Invalid last name format")

const mobile = body("mobile")
	.custom(value => !/\s/.test(value))
	.withMessage("Invalid mobile number")
	.isMobilePhone()
	.withMessage("Invalid mobile number")

const UserSchema = [
    email,
	password,
	first_name,
	last_name,
    mobile,
    validator
]

module.exports = UserSchema