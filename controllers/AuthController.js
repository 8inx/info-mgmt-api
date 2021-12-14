const { sql, config } = require('../connection')
const ObjectID = require("../utils/Objectid").ObjectID
const Cipher = require('../utils/Cipher')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
    try {
        const id = new ObjectID().toHexString()
        const pool = await sql.connect(config)
        
        const user = await pool.request()
            .input('email', sql.VarChar(50), req.body.email)
            .query(`SELECT email FROM [User] WHERE [email] = @email`)

        if(user.recordset[0] ) return res.status(401).json("Email already is taken")

        const hashPassword = Cipher.create(req.body.password)
        
        await pool.request()
            .input('id', sql.VarChar(50), id)
            .input('first_name', sql.VarChar(50), req.body.first_name.toLowerCase())
            .input('last_name', sql.VarChar(50), req.body.last_name.toLowerCase())
            .input('email', sql.VarChar(50), req.body.email)
            .input('password', sql.NVarChar(50), hashPassword)
            .query(`
                INSERT INTO 
                [User]  ([id], [first_name], [last_name],[email], [password])
                VALUES  (@id, @first_name, @last_name, @email, @password)
            `)
        res.status(200).json("registration success")
    } catch (error) {
        res.status(500).json(error)
    }
}


const login = async (req, res) => {
    try {
        const pool = await sql.connect(config)
        const record = await pool.request()
            .input('email', sql.VarChar(50), req.body.email)
            .query(`SELECT * FROM [User] WHERE [email] = @email`)

        const user = record.recordset[0]
        !user && res.status(401).json("Incorrect email or password")

        const isPasswordCorrect = Cipher.compare(req.body.password, user.password)

        !isPasswordCorrect && res.status(401).json("Incorrect email or password")

        const accessToken = jwt.sign({
            id: user.id,
            is_admin: user.is_admin
        }, process.env.SEC_ACCESS_TOKEN, {expiresIn: "1d"})

        const { password, ...credentials } = user
        res.status(200).json({...credentials, accessToken})

    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = { register, login }