const { createRating, deleteRating, updateRating, getRating } = require('../controllers/RatingController')
const { verifyToken, verifyAuthorization } = require('../middlewares/verification')
const RatingSchema = require('../schema/RatingSchema')

const router = require('express').Router()

/* create */
/* http://host:port/api/rating */
router.post("/", RatingSchema, verifyToken, verifyAuthorization, createRating)

/* update */
/* http://host:port/api/rating */
router.put("/", RatingSchema, verifyToken, verifyAuthorization, updateRating)

/* delete */
/* http://host:port/api/rating */
router.delete("/product_id/:product_id", verifyToken, deleteRating)

/* get */
/* http://host:port/api/rating */
router.get("/product_id/:product_id", verifyToken, getRating)

module.exports = router