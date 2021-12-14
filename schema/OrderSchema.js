const {body, validator} = require('./validator')


const products = body("products")
    .isArray({min:1})
    .withMessage("Product must contain atleast 1 item")

const products_product_id = body("products.*.product_id")
    .not()
    .isEmpty()
    .withMessage("Invalid product id")

const products_quantity = body("products.*.quantity")
    .isInt({min:1})
    .withMessage("Invalid quantity")

const products_color = body("products.*.color")
    .not()
    .isEmpty()
    .withMessage("Invalid color")

const products_size = body("products.*.size")
    .not()
    .isEmpty()
    .withMessage("Invalid size")


const address = body("address")
    .not()
    .isEmpty()
    .withMessage("Shipping address is required")

const OrderSchema = [
    products,
    products_product_id,
    products_quantity,
    products_color,
    products_size,
    address,
    validator
]

module.exports = OrderSchema