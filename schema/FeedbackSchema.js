/* eslint-disable no-useless-escape */
const {body, validator} = require('./validator')


const comment = body("comment")
    .isLength({max:700})
    .withMessage("Comment should exceed more than 700 characters")

const product_id = body("product_id")
    .not()
    .isEmpty()
    .withMessage("Invalid product id")

const FeedbackSchema = [
    comment,
    product_id.optional(),
    validator
]

module.exports = FeedbackSchema