const { createProduct, updateProduct, deleteProduct, getProductById, getAllProducts } = require('../controllers/ProductController')
const { verifyToken, verifyAdmin } = require('../middlewares/verification')
const ProductSchema = require('../schema/ProductSchema')

const router = require('express').Router()

/* create */
/* http://host:port/api/auth/register */
router.post("/", ProductSchema, verifyToken, verifyAdmin, createProduct)

/* update */
/* http://host:port/api/product/:id */
router.put("/:id", ProductSchema, verifyToken, verifyAdmin, updateProduct)

/* delete */
/* http://host:port/api/product/:id */
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct)

/* get by ID */
/* http://host:port/api/product/id/:id */
router.get("/id/:id", getProductById)

/* get all */
/* http://host:port/api/product/id/:id */
router.get("/", getAllProducts)

module.exports = router