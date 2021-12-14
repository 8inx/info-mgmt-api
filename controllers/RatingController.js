const { sql, config } = require("../connection")

const createRating = async (req, res ) => {
    try {
        const pool = await sql.connect(config)
        /* check user purchase history */
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
        console.log(purchaseCount.recordsets[0][0].purchaseCount)
        /* if user has not been purchase this product, return not allowed */
        const canRate = purchaseCount.recordsets[0][0].purchaseCount > 0
        if(!canRate) return res.status(401).json("Not allowed to rate")
        
        /* create only one user rating per product */
        await pool.request()
            .input('user_id', sql.VarChar(50), req.body.user_id)
            .input('product_id', sql.VarChar(50), req.body.product_id)
            .input('score', sql.Decimal(2,1), req.body.score)
            .query(`
                    IF NOT EXISTS 
                    (   SELECT score
                        FROM [Rating] 
                        WHERE [user_id] = @user_id
                        AND [product_id] = @product_id
                    )
                        INSERT INTO [Rating]    ( [user_id], product_id, score ) 
                        VALUES                  ( @user_id, @product_id, @score );
                        
            `)
        res.status(200).json("rating successfully created")
    } catch (error) {
        res.status(500).json(error)
    }
}

const updateRating = async(req, res) => {
    try {
        const pool = await sql.connect(config)
        const updatedRating = await pool.request()
            .input('user_id', sql.VarChar(50), req.body.user_id)
            .input('product_id', sql.VarChar(50), req.body.product_id)
            .input('score', sql.Decimal(2,1), req.body.score)
            .query(`
                UPDATE  [Rating]
                SET     score = @score,
                        modified_at = GETDATE()
                WHERE   user_id = @user_id
                AND     product_id = @product_id

                SELECT  *
                FROM    [Rating]
                WHERE   user_id = @user_id
                AND     product_id = @product_id
            `)
        res.status(200).json(updatedRating.recordsets[0])
    } catch (error) {
        res.status(500).json(error)
    }
}

const deleteRating = async(req, res) => {
    try {
        const pool = await sql.connect(config)
        await pool.request()
            .input('user_id', sql.VarChar(50), req.user.id)
            .input('product_id', sql.VarChar(50), req.params.product_id)
            .query(`
                DELETE  [Rating] 
                WHERE   user_id = @user_id
                AND     product_id = @product_id
            `)
    res.status(200).json("rating successfully deleted")
    } catch (error) {
        res.status(500).json(error)
    }
}

const getRating = async(req, res) => {
    try {
        const pool = await sql.connect(config)
        const request = await pool.request()
            .input('user_id', sql.VarChar(50), req.user.id)
            .input('product_id', sql.VarChar(50), req.params.product_id)
            .query(`
                SELECT  score
                FROM    [Rating] 
                WHERE   user_id = @user_id
                AND     product_id = @product_id
            `)
    res.status(200).json(request.recordsets[0][0])
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = {
    createRating,
    updateRating,
    deleteRating,
    getRating
}