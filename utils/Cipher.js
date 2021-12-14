const Crypto = require('crypto-js')
const dotenv = require('dotenv')
dotenv.config()

const secret_passphrase = process.env.SEC_CRYPTO_PASSPHRASE

const create = (password) => {
    return Crypto.AES.encrypt( password, secret_passphrase).toString()
}

const compare = (requestPassword, hashPassword) => {
    const registered =  Crypto.AES.decrypt(hashPassword,secret_passphrase).toString(Crypto.enc.Utf8)
    return requestPassword === registered
}

const Cipher = { create, compare }
module.exports = Cipher