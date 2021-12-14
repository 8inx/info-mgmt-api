const { sql, config } = require('../connection')
const ObjectID = require('../utils/Objectid').ObjectID
const escapeString = require('sql-escape-string')

const createOrder = async (req, res) => {
    const id = new ObjectID().toHexString()

    const order_items = req.body.products.map(value => {
        const product_id = escapeString(value.product_id)
        const color = escapeString(value.color.toUpperCase())
        const size = escapeString(value.size.toUpperCase())
        const quantity = escapeString(value.quantity.toString())
        return `('${id}', ${product_id}, ${color}, ${size}, ${quantity})` 
    })

    try {
        const pool = await sql.connect(config)
        await pool.request()
            .input('id', sql.VarChar(50), id)
            .input('user_id', sql.VarChar(50), req.body.user_id)
            .input('amount', sql.VarChar(255), req.body.amount)
            .input('address', sql.VarChar(255), req.body.address)
            .query(`
                INSERT into [Order] (id, user_id, amount, address) VALUES (@id, @user_id, @amount, @address)
                
                INSERT into [OrderItem] (order_id, product_id, color, size, quantity)
                VALUES ${order_items.join(',')}
            `)
            .catch(err => res.status(401).json(err))

        res.status(200).json({order_id: id})
    } catch (error) {
        res.status(500).json(error)
    }
}

const updateOrder = async (req, res) => {

    const id = req.params.id

    const order_items = req.body.products.map(value => {
        const product_id = escapeString(value.product_id)
        const color = escapeString(value.color.toUpperCase())
        const size = escapeString(value.size.toUpperCase())
        const quantity = escapeString(value.quantity.toString())
        return `('${id}', ${product_id}, ${color}, ${size}, ${quantity})` 
    })

    try {
        const pool = await sql.connect(config)
        await pool.request()
            .input('user_id', sql.VarChar(50), req.body.user_id)
            .input('id', sql.VarChar(50), req.params.id)
            .input('address', sql.VarChar(255), req.body.address)
            .input('status', sql.VarChar(50), req.body.status)
			.query(`
				UPDATE [Order]
				SET	
					[user_id] = ISNULL(@user_id,[user_id]),
					[address] = ISNULL(@address, [address]),
					[status] = ISNULL(@status, [status]),
                    [modified_at] = GETDATE()
				WHERE [id] = @id;

                DELETE [OrderItem] WHERE order_id=@id;

                INSERT into [OrderItem] (order_id, product_id, color, size, quantity)
                VALUES ${order_items.join(',')};
			`)
            .catch(err => res.status(401).json(err))

        const updatedOrder = await pool.request()
            .input('id', sql.VarChar(50), req.params.id)
            .query(`
                SELECT * FROM [Order] WHERE [id] = @id;
                SELECT * FROM [OrderItem] WHERE [order_id] = @id;
            `)
            .then(data => {
                const product_list = data.recordsets[1]
                return {...data.recordsets[0][0], products: product_list}
            })
            .catch(err => res.status(401).json(err))

        
        res.status(200).json(updatedOrder)

    } catch (error) {
        res.status(500).json(error)
    }
}

const deleteOrder =  async (req, res) => {
	try {
		const pool =  await sql.connect(config)
		await pool.request()
			.input('id', sql.VarChar(50), req.params.id)
			.query(`DELETE [Order] WHERE id=@id`)

		res.status(200).json("Order has been deleted")
	} catch (error) {	
		res.status(500).json(error)
	}
}

const getOrderById = async (req, res) => {
    try {
        const pool = await sql.connect(config)
        const order = await pool.request()
            .input('id', sql.VarChar(50), req.params.id)
            .query(`
                SELECT * FROM [Order] WHERE id=@id
                SELECT * FROM [OrderItem] WHERE [order_id] = @id;
                `)
            .then(data => {
                const product_list = data.recordsets[1]
                return {...data.recordsets[0][0], products: product_list}
            })
            .catch(error => {throw error})

        res.status(200).json(order)
    } catch (error) {
        res.status(500).json(error)
    }
}

const getUserOrders = async (req, res) => {
    try {

        let condition = "status='pending'"
        if(req.query.approved) {
            condition = "status='approved'"
        }

        const page =  req.query.page?(req.query.page>1? req.query.page : 1 ) : 1
        const pool = await sql.connect(config)
        const data  = await pool.request()
            .input('id', sql.VarChar(50), req.params.user_id)
            .input('page', sql.Int, page)
			.input('limit', sql.Int, req.query.limit || 20 )
            .query(`
                SELECT o.*,
                (
                    SELECT oi.product_id
                        ,oi.color
                        ,oi.size
                        ,oi.quantity
                    FROM [OrderItem] oi
                    WHERE oi.order_id = o.id
                    FOR JSON PATH   
                ) as products
                FROM [Order] o
                WHERE o.user_id = @id AND ${condition}
                ORDER BY o.created_at ${req.query.new?'DESC':'ASC'}
                OFFSET ((@page-1)* @limit) ROWS
				FETCH NEXT @limit ROWS ONLY
                
                SELECT(SELECT COUNT(*) FROM [Order] WHERE user_id = @id AND ${condition}) as totalRows

            `)

        const orders = {
            results: data.recordsets[0].map(item =>{
                item.products = JSON.parse(item.products)
                return item
            }),
            totalRows: data.recordsets[1][0].totalRows
        }

        res.status(200).json(orders)

    } catch (error) {
        res.status(500).json(error)
    }
}

const getAllOrders = async (req, res) => {
    try {

        let condition = "status='pending'"
        if(req.query.approved) {
            condition = "status='approved'"
        }

        const pool = await sql.connect(config)
        const data  = await pool.request()
            .input('page', req.query.page?(req.query.page>1? req.query.page : 1 ) : 1)
			.input('limit', sql.Int, req.query.limit || 20 )
            .query(`
                SELECT o.*,
                (
                    SELECT oi.product_id
                        ,oi.color
                        ,oi.size
                        ,oi.quantity
                    FROM [OrderItem] oi
                    WHERE oi.order_id = o.id
                    FOR JSON PATH   
                ) as products
                FROM [Order] o
                WHERE ${condition}
                ORDER BY o.created_at
                OFFSET ((@page-1)* @limit) ROWS
				FETCH NEXT @limit ROWS ONLY

                SELECT(SELECT COUNT(*) FROM [Order] WHERE ${condition}) as totalRows
            `)
        
        const orders = {
            results: data.recordsets[0].map(item =>{
                item.products = JSON.parse(item.products)
                return item
            }),
            totalRows: data.recordsets[1][0].totalRows

        }

        res.status(200).json(orders)
    } catch (error) {
        res.status(500).json(error)
    }
}

const getMonthlyIncome = async (req, res) => {
    try {
        const pool = await sql.connect(config)
        const income = await pool.request()
            .query(`
                SELECT 	
                    DATEPART(MONTH, [created_at]) as [month],
                    DATEPART(YEAR, [created_at]) as [year],
                    SUM(amount) as [total]
                FROM [Order]
                WHERE [created_at] > DATEADD(YEAR,-1,GETDATE())
                GROUP 
                    BY DATEPART(MONTH, [created_at]), 
                    DATEPART(YEAR, [created_at])
                ORDER BY MAX([created_at]) DESC
            `)
            .then(data => {return data.recordset})
            .catch(err => {throw err})
        res.status(200).json(income)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = {
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    getUserOrders,
    getAllOrders,
    getMonthlyIncome
};