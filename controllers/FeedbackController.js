const { sql, config } = require("../connection")
const ObjectID = require('../utils/Objectid').ObjectID

const createFeedback = async (req, res ) => {
    try {
        const pool = await sql.connect(config)
        const purchaseCount = await pool.request()
            .input('user_id', sql.VarChar(50), req.body.user_id)
            .input('product_id', sql.VarChar(50), req.body.product_id)
            .query(`
                    ;WITH cte_order as (
                        SELECT [user_id], [id] FROM [Order]
                        WHERE [user_id] = @user_id
                    )
                    SELECT COUNT(*) AS purchaseCount
                    FROM [OrderItem]
                    INNER JOIN cte_order co
                    ON order_id = co.id
                    AND product_id = @product_id
                    AND co.user_id = @user_id
            `)
        /* only user that purchased the item can make feedback */
        const canComment = purchaseCount.recordsets[0][0].purchaseCount > 0
        if(!canComment) return res.status(401).json("Not allowed to rate")
        
        const feedback_id = new ObjectID().toHexString()

        await pool.request()
            .input('id', sql.VarChar(50), feedback_id)
            .input('user_id', sql.VarChar(50), req.user.id)
            .input('product_id', sql.VarChar(50), req.body.product_id)
            .input('comment', sql.VarChar(sql.MAX), req.body.comment)
            .query(`
                    INSERT INTO [Feedback]  ( [id], [user_id], [product_id], [comment] ) 
                    VALUES                  ( @id, @user_id, @product_id, @comment );
                        
            `)
        res.status(200).json("feedback successfully posted")
    } catch (error) {
        res.status(500).json(error)
    }
}

const updateFeedback = async(req, res) => {
    try {
        const pool = await sql.connect(config)
        const updatedFeedback = await pool.request()
            .input('id', sql.VarChar(50), req.params.id)
            .input('comment', sql.VarChar(sql.MAX), req.body.comment)
            .query(`
                UPDATE  [Feedback]
                SET     comment = @comment,
                        modified_at = GETDATE()
                WHERE   id = @id

                SELECT  *
                FROM    [Feedback]
                WHERE   id = @id
            `)
        res.status(200).json(updatedFeedback.recordsets[0])
    } catch (error) {
        res.status(500).json(error)
    }
}

const deleteFeedback = async(req, res) => {
    try {
        const pool = await sql.connect(config)
        await pool.request()
            .input('id', sql.VarChar(50), req.params.id)
            .input('user_id', sql.VarChar(50), req.user.id)
            .query(`
                DELETE  [Feedback] WHERE   id = @id
            `)
    res.status(200).json("feedback successfully deleted")
    } catch (error) {
        res.status(500).json(error)
    }
}

const getFeedback = async(req, res) => {
    try {
        const pool = await sql.connect(config)
        const request = await pool.request()
            .input('id', sql.VarChar(50), req.params.id)
            .query(`
                SELECT  *
                FROM    [Feedback] 
                WHERE   id = @id
            `)
    res.status(200).json(request.recordsets[0][0])
    } catch (error) {
        res.status(500).json(error)
    }
}

const getProductFeedbacks = async(req, res) => {
    try {
        const page = req.query.page
        const limit = req.query.limit
        const pool = await sql.connect(config)
        const data = await pool.request()
            .input('product_id', sql.VarChar(50), req.params.product_id)
            .input('page', sql.Int, page? ( page > 1 ? page : 1 ) : 1 )
            .input('limit', sql.Int, limit || 20 )
            .query(`
                SELECT  *
                FROM    [Feedback]
                WHERE   product_id = @product_id
                ORDER BY created_at DESC
                OFFSET ((@page-1)* @limit) ROWS
				FETCH NEXT @limit ROWS ONLY

                SELECT
                (   SELECT  COUNT(*) 
                    FROM    Feedback 
                    WHERE   product_id = @product_id
                ) as totalRows
            `)
        const feedbacks = {
            results: data.recordsets[0],
            totalRows: data.recordsets[1][0].totalRows
        }
    res.status(200).json(feedbacks)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = {
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedback,
    getProductFeedbacks
}