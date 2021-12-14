const inflection = require('inflection')
const escapeString = require('sql-escape-string')
const ObjectID = require('../utils/Objectid').ObjectID
const {sql, config} = require('../connection')


const createProduct = async (req, res) => {
    try {
        // generate object id
        const product_id = new ObjectID().toHexString()
        // map categories
        const categories = req.body.categories.map(value => {
            const keyword = escapeString(value.toLowerCase())
            return `('${product_id}', ${keyword})`
        })

        const pool = await sql.connect(config) // connection
        // insert into Product and Category
        await pool.request()
            .input('id', sql.VarChar(50), product_id)
            .input('name', sql.VarChar(50), req.body.name)
            .input('description', sql.VarChar(sql.MAX), req.body.description)
            .input('price', sql.Decimal(19,4), req.body.price)
            .input('colors', sql.VarChar(62), req.body.colors.join(",").toLowerCase())
            .input('sizes', sql.VarChar(50), req.body.sizes.join(",").toLowerCase())
            .input('images', sql.NVarChar(sql.MAX),req.body.images.join(","))
            .query(`
                INSERT INTO 
                [Product]   ([id], [name], [description], [colors], [sizes], [price], [images])
				VALUES      (@id, @name, @description, @colors, @sizes, @price, @images);

                INSERT INTO 
                [Category]  (product_id, keyword) 
                VALUES      ${categories.join(",")};
			`)
            .then(()=> res.status(200).json({id: product_id, ...req.body}))
            .catch(err => { throw err})

    } catch (error) {
        res.status(500).json(error)     
    }
}


const updateProduct = async (req, res) => {

	const product_id = escapeString(req.params.id)
	const categories = req.body.categories.map(value => {
        const keyword = escapeString(value)
        return `(${product_id}, ${keyword})`
    })

	try {
		const pool = await sql.connect(config)
		await pool.request()
            .input('id', sql.VarChar(50), req.params.id)
            .input('name', sql.VarChar(50), req.body.name)
            .input('description', sql.VarChar(sql.MAX), req.body.description)
            .input('colors', sql.VarChar(50), req.body.colors)
            .input('sizes', sql.VarChar(50), req.body.sizes)
            .input('price', sql.Decimal(19,4), req.body.price)
            .input('image', sql.VarChar(50), req.body.image)
            .input('in_stock', sql.VarChar(50), req.body.in_stock)
			.query(`
				UPDATE [Product]
				SET	
					[name] = ISNULL(@name,[name]),
					[description] = ISNULL(@description, [description]),
					[price] = ISNULL(@price, [price]),
					[colors] = ISNULL(@colors, [colors]),
					[sizes] = ISNULL(@sizes, [sizes]),
					[images] = ISNULL(@image, [images]),
					[in_stock] = ISNULL(@in_stock, [in_stock]),
                    [modified_at] = GETDATE()
				WHERE 
                    [id] = @id
			`)
		
		/* update all categories by deleting the old one and adding new categories*/
		await pool.request()
			.input('product_id', sql.VarChar(50), req.params.id)
			.query(`DELETE [Category] WHERE [product_id] = @product_id;`)
			
        await pool.request()
            .query(`
                INSERT INTO [Category] (product_id, keyword) 
                VALUES ${categories.join(",")}
            `)

		res.status(200).json("Product updated")
	} catch (error) {
		res.status(500).json(error)
	}
}


const deleteProduct =  async (req, res) => {
	try {
		const pool =  await sql.connect(config)
		await pool.request()
			.input('id', sql.VarChar(50), req.params.id)
			.query(`DELETE Product WHERE id=@id`)

		res.status(200).json("Product has been deleted")
	} catch (error) {	
		res.status(500).json(error)
	}
}

const getProductById = async (req, res) => {

	try {
		const pool =  await sql.connect(config)

		const productRecord = await pool.request()
			.input('id', sql.VarChar(50), req.params.id)
			.query(`SELECT * FROM Product WHERE id = @id`)
		
		const categoryRecords = await pool.request()
			.input('id', sql.VarChar(50), req.params.id)
			.query(`SELECT * FROM Category WHERE product_id = @id;`)

        const salesRecord = await pool.request()
            .input('id', sql.VarChar(50), req.params.id)
            .query(`
                SELECT 	DATEPART(MONTH, [created_at]) as [month],
                        SUM(oi.quantity) as [total]
                FROM [OrderItem] oi
                JOIN [Order] o
                ON oi.order_id = o.id
                AND oi.product_id = '2022-dec'
                AND o.created_at > DATEADD(MONTH,-2,GETDATE())
                GROUP BY    DATEPART(MONTH, [created_at])
                ORDER BY MAX([created_at])
            `)
        const ratings = await pool.request()
            .input('id', sql.VarChar(50), req.params.id)
            .query(`
                ;WITH cte_total as (
                    SELECT score, COUNT(*) as people
                    FROM [Rating]
                    WHERE product_id = @id
                    GROUP BY score
                )
                SELECT (SUM(ts.score * ts.people)/SUM(ts.people)) as ratings
                FROM cte_total ts
            `)
        
		const {images, colors, sizes, ...other} = productRecord.recordset[0]
		const product = {
			...other,
			categories: categoryRecords.recordset.flatMap( v => v.keyword),
			images: images.split(","),
			colors: colors.split(","),
			sizes: sizes.split(","),
            ratings: ratings.recordsets[0][0].ratings,
            sales : salesRecord.recordsets[0]
		}

		res.status(200).json(product)
	} catch (error) {	
		res.status(500).json(error)
	}
}

const getAllProducts = async (req, res) => {
    try {

        const page = req.query.page
        const limit = req.query.limit || 10
        const sort = req.query.sort
        const categories = req.query.categories
        const keywords = categories && categories.flatMap(item => [
            escapeString(inflection.singularize(item.toLowerCase())),
            escapeString(inflection.pluralize(item.toLowerCase())),
        ])

        const product_categories = `(  
            SELECT STRING_AGG( keyword, ',' )
            FROM [Category] 
            WHERE product_id = p.id
        )`

        const condition = categories?
            `JOIN(
                SELECT product_id, COUNT(*) as bestmatches
                FROM [Category]
                WHERE keyword IN (${keywords})
                GROUP BY product_id
            ) cat
            ON cat.product_id = p.id` : ''

        let orderByBestmatches = `${categories? 'bestmatches DESC,': ''}`
        let sortBy = 'created_at'
            if(sort==='latest') sortBy = 'created_at DESC'
            else if(sort == 'price-desc') sortBy = 'price DESC'
            else if(sort == 'price-asc') sortBy = 'price ASC'
            
        const pool =  await sql.connect(config)
        const data = await pool.request()
            .input('page', sql.Int, page? ( page > 1 ? page : 1 ) : 1 )
            .input('limit', sql.Int, limit )
            .input('sort', sql.VarChar(15), sort )
            .query(`
                SELECT  p.* ,${product_categories} as categories
                FROM Product p
                ${condition}
                ORDER BY ${orderByBestmatches} ${sortBy}
                OFFSET ((@page-1)* @limit) ROWS
				FETCH NEXT @limit ROWS ONLY

                SELECT(SELECT COUNT(*) FROM Product p ${condition}) as totalRows
            `)
        const results = data.recordsets[0].map(item => {
            item.colors= item.colors.split(',')
            item.sizes= item.sizes.split(','),
            item.images= item.images.split(',')
            return item
        })
        const products = {
            results: results,
            totalRows: data.recordsets[1][0].totalRows
        }
        res.status(200).json(products)
    } catch (error) {
		res.status(500).json(error)
    }
}



module.exports = {
    createProduct,
    deleteProduct,
    updateProduct,
    getProductById,
    getAllProducts
}