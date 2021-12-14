/* eslint-disable no-useless-escape */
const {body, validator} = require('./validator')

const name = body("name")
    .exists({ checkFalsy: true })
    .withMessage("Product name is required")
    .isLength({ min: 4 })
	.withMessage("First name must contain atleast 4 characters")

const description = body("description")
    .isLength({min:100})
    .withMessage("Description should more than 100 characters")

const price = body("price")
    .exists({ checkFalsy: true })
	.withMessage("price is required")
	.isCurrency({allow_decimal:true})
	.withMessage("Invalid price format")

const images = body("images")
    .isArray({min:1})
    .withMessage("Product must contain atleast 1 image")

const colors = body("colors")
    .isArray()
    .withMessage("Invalid color value")

const sizes = body("sizes")
    .isArray()
    .withMessage("Invalid size value")

const categories = body("categories")
    .isArray({min:1, max: 5})
    .withMessage("Product must contain atleast 1-5 categories")

const ProductSchema = [
    name,
    description,
    price,
    images,
    colors,
    sizes,
    categories,
    validator
]

module.exports = ProductSchema