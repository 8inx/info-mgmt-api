const { createFeedback, deleteFeedback, getFeedback, updateFeedback, getProductFeedbacks } = require("../controllers/FeedbackController")
const { verifyAuthorization, verifyToken } = require("../middlewares/verification")
const FeedbackSchema = require("../schema/FeedbackSchema")

const router = require('express').Router()

/* create */
/* http://host:port/api/feedback */
router.post("/", FeedbackSchema, verifyToken, verifyAuthorization, createFeedback)

/* update */
/* http://host:port/api/feedback/:id */
router.put("/:id", FeedbackSchema, verifyToken, verifyAuthorization, updateFeedback)

/* delete */
/* http://host:port/api/feedback/:id */
router.delete("/:id", verifyToken, verifyAuthorization, deleteFeedback)

/* get */
/* http://host:port/api/feedback */
router.get("/:id", getFeedback)

/* get product feedback */
/* http://host:port/api/feedback */
router.get("/product_id/:product_id", getProductFeedbacks)

module.exports = router