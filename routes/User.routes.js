const { updateUser, deleteUser, getUserById, getAllUser, getUserStats } = require('../controllers/UserController')
const { verifyToken, verifyAuthorization, verifyAdmin } = require('../middlewares/verification')
const UserSchema = require('../schema/UserSchema')
const router = require('express').Router()

/* update */
/* http://host:port/api/user/:id */
router.put("/:id", UserSchema, verifyToken, verifyAuthorization, updateUser)

/* delete */
/* http://host:port/api/user/:id */
router.delete("/:id", verifyToken, verifyAuthorization, deleteUser)

/* get by id */
/* https://host:port/api/user/id/:id */
router.get("/id/:id", verifyToken, verifyAuthorization, getUserById)

/* get all user */
/* http://host:port/api/user */
/* http://host:port/api/user?new=true */
/* http://host:port/api/user?page=x&limit=y */
router.get("/", verifyToken, verifyAdmin, getAllUser)

/* user stats */
/* http://host:port/api/user/stats */
router.get("/stats", verifyToken, verifyAdmin, getUserStats)

module.exports = router