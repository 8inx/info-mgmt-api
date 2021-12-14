const { sql, config } = require('../connection')
const Cipher = require('../utils/Cipher')
const dotenv = require('dotenv')
dotenv.config()


const updateUser = async( req, res) => {
    if(req.body.password){
        req.body.password = Cipher.create(req.body.password)
    }
    try {
        const pool = await sql.connect(config)
        await pool.request()
			.input('id', sql.VarChar(50), req.params.id )
            .input('email', sql.VarChar(50), req.body.email)
            .input('password', sql.VarChar(50), req.body.password)
            .input('first_name', sql.VarChar(50), req.body.first_name)
            .input('last_name', sql.VarChar(50), req.body.last_name)
            .input('address', sql.VarChar(255), req.body.address)
            .input('mobile', sql.VarChar(50), req.body.mobile)
			.input('image', sql.NVarChar(sql.MAX), req.body.image)
            .query(`
				UPDATE	[User]
				SET		[first_name] = ISNULL(@first_name, [first_name]),
						[last_name] = ISNULL(@last_name, [last_name]),
						[email] = ISNULL(@email, [email]),
						[password] = ISNULL(@password, [password]),
						[address] = ISNULL(@address, [address]),
						[mobile] = ISNULL(@mobile, [mobile]),
						[image] = @image,
						[modified_at] = GETDATE()
				WHERE 	[id] = @id
			`)
			.catch(error=>{
				if(error.number == 2627 && error.class == 14){
					res.status(500).json("Email is already taken")
				}
			})

		const updatedUser = await pool.request()
			.input('id', sql.VarChar(50), req.params.id)
			.query(`SELECT * FROM [User] WHERE [id]= @id`)
        
        const {password, ...credentials} = updatedUser.recordset[0]

        res.status(200).json(credentials)

    } catch (error) {
        res.status(500).json(error)
    }
}

const deleteUser = async (req, res) => {
	try {
		const pool =  await sql.connect(config)
		await pool.request()
			.input('id', sql.VarChar(50), req.params.id)
			.query(`DELETE FROM [User] WHERE [id] = @id`)

		res.status(200).json("User has been deleted")

	} catch (error) {	
		res.status(500).json(error)
	}
}

const getUserById = async (req, res) => {
	try {
		const pool =  await sql.connect(config)
		const user = await pool.request()
			.input('id', sql.NVarChar(50), req.params.id)
			.query(`SELECT * FROM [User] WHERE [id]= @id`)
		
        const isUserExist = user.recordset[0] != null
        !isUserExist && res.status(404).json("User does not exist")

        const {password, ...credentials} = user.recordset[0]

        res.status(200).json(credentials)
	} catch (error) {	
		res.status(500).json(error)
	}
}

const getAllUser = async (req, res) => {
	try {
		const pool =  await sql.connect(config)
		const data = await pool.request()
            .input('new', sql.Int, req.query.new? 1 : 0)
			.input('page', sql.Int, req.query.page?(req.query.page>1? req.query.page : 1 ) : 1)
			.input('limit', sql.Int, req.query.limit || 20 )
			.query(`
				SELECT [id]
					,[email]
					,[first_name]
					,[last_name]
					,[address]
					,[mobile]
					,[image]
					,[is_admin]
					,[created_at]
					,[modified_at]
				FROM [User]
				ORDER BY 
					CASE WHEN @new = 1 THEN [created_at] END DESC,
					CASE WHEN @new = 0 THEN [created_at] END ASC
				OFFSET ((@page - 1 )* @limit) ROWS
				FETCH NEXT @limit ROWS ONLY

                SELECT(SELECT COUNT(*) FROM [User]) as totalRows
			`)

		res.status(200).json({
			results:data.recordsets[0],
			totalRows: data.recordsets[1][0].totalRows
		})
	} catch (error) {	
		res.status(500).json(error)
	}
}

const getUserStats = async (req, res) => {
    try {
		const pool = await sql.connect(config)
		const data = await pool.request()
            .query(`
				SELECT 	
					DATEPART(MONTH, [created_at]) as [month],
					DATEPART(YEAR, [created_at]) as [year],
					COUNT(id) as [total]
				FROM [User]
				WHERE [created_at] > DATEADD(YEAR,-1,GETDATE())
				GROUP BY 
					DATEPART(MONTH, [created_at]), 
					DATEPART(YEAR, [created_at])
				ORDER BY MAX([created_at]) DESC
			`)
            
		res.status(200).json(data.recordset)
	} catch (error) {
		res.status(500).json(error)
	}
}

module.exports = {
    updateUser,
    deleteUser,
    getUserById,
    getAllUser,
    getUserStats
}