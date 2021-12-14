const {body, validator} = require('./validator')

const product_id = body("product_id")
    .not()
    .isEmpty()
    .withMessage("Invalid product id")

const score = body("score")
    .isFloat({min:1, max: 5})
    .withMessage("Invalid score")

const RatingSchema = [
    score,
    product_id,
    validator
]

module.exports = RatingSchema