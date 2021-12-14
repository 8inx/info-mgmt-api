const {createOrder, updateOrder, deleteOrder, getOrderById, getUserOrders, getAllOrders, getMonthlyIncome} = require('../controllers/OrderController')
const { verifyToken, verifyAuthorization, verifyAdmin } = require('../middlewares/verification')
const OrderSchema = require('../schema/OrderSchema')

const router = require('express').Router()

/* create */
/* http://host:port/api/order */
router.post("/",OrderSchema, verifyToken, createOrder)

/* update */
/* http://host:port/api/order/:id */
router.put("/:id",OrderSchema, verifyToken, verifyAdmin, updateOrder)

/* delete */
/* http://host:port/api/order/:id */
router.delete("/:id", verifyToken, verifyAdmin, deleteOrder)

/* get by id */
/* http://host:port/api/order/id/ */
router.get("/id/:id", verifyToken, verifyAdmin, getOrderById)

/* get by user_id */
/* http://host:port/api/order/user_id/:user_id */
/* http://host:port/api/order/user_id/:user_id?approved&new=1&page=0&limit=20 */
router.get("/user_id/:user_id", verifyToken, verifyAuthorization, getUserOrders)

/* get all orders */
/* http://host:port/api/order */
/* http://host:port/api/order?approved=1&page=0&limit=20 */
router.get("/", verifyToken, verifyAdmin, getAllOrders)

/* get monthly income */
/* http://host:port/api/order/income */
router.get("/income", verifyToken, verifyAdmin, getMonthlyIncome)

module.exports = router